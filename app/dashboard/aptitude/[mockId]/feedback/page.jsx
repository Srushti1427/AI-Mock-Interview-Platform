"use client";
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AptitudeFeedback({params}) {
    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);

    useEffect(() => {
        GetFeedbackDetails();
    }, []);

    const GetFeedbackDetails = async () => {
        try {
            const res = await fetch(`/api/aptitude/${params.mockId}`);
            if (!res.ok) {
                console.error('Failed to fetch aptitude test', await res.text());
                return;
            }
            const result = await res.json();
            if (result) {
                setTestData(result);
                try {
                    // First try to get freshly generated questions from localStorage
                    let questionsToUse = [];
                    const savedQuestions = localStorage.getItem(`aptitude_questions_${params.mockId}`);
                    
                    if (savedQuestions) {
                        questionsToUse = JSON.parse(savedQuestions);
                    } else {
                        // Fallback to stored questions if fresh ones aren't available
                        questionsToUse = JSON.parse(result.jsonMockResp || '[]');
                    }
                    
                    setQuestions(questionsToUse);

                    const saved = localStorage.getItem(`aptitude_answers_${params.mockId}`);
                    if (saved) {
                        const parsedAnswers = JSON.parse(saved);
                        setUserAnswers(parsedAnswers);

                        let currScore = 0;
                        questionsToUse.forEach((q, index) => {
                            if (parsedAnswers[index] === q.CorrectAnswer) {
                                currScore += 1;
                            }
                        });
                        setScore(currScore);
                    }
                } catch (e) {
                    console.error("Failed to parse", e);
                }
            }
        } catch (err) {
            console.error('Error fetching aptitude test:', err);
        }
    }

    if (!questions || questions.length === 0) return <div className="p-10 text-muted-foreground">Loading Results...</div>;

    return (
        <div className="max-w-4xl mx-auto p-10">
            <h2 className="text-4xl font-bold text-green-500 mb-2">Test Completed!</h2>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Here is your customized feedback</h2>
            
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl text-primary font-medium mb-1">
                    Your overall score: <strong className="text-3xl">{score} / {questions.length}</strong>
                </h2>
                <h2 className="text-sm text-muted-foreground">
                    Review your selected answers and the correct answers below.
                </h2>
            </div>

            <div className="flex flex-col gap-6">
                {questions.map((q, index) => {
                    const isCorrect = userAnswers[index] === q.CorrectAnswer;
                    return (
                        <div key={index} className="border border-border rounded-xl p-6 bg-card shadow-sm">
                            <h2 className="text-lg font-medium mb-4 text-foreground">{index + 1}. {q.Question}</h2>
                            <div className="flex flex-col gap-3 p-4 bg-secondary/30 rounded-lg border border-border/50">
                                <h2 className={`font-medium ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                    Your Answer: <span className="text-foreground ml-2 font-normal">{userAnswers[index] || "Unanswered"}</span>
                                    {isCorrect && " ✓"}
                                </h2>
                                {!isCorrect && (
                                    <h2 className="text-green-500 font-medium">
                                        Correct Answer: <span className="text-foreground ml-2 font-normal">{q.CorrectAnswer}</span>
                                    </h2>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10">
                <Link href="/dashboard/aptitude">
                    <Button className="w-full sm:w-auto px-8">Return to Aptitude Dashboard</Button>
                </Link>
            </div>
        </div>
    )
}

export default AptitudeFeedback;
