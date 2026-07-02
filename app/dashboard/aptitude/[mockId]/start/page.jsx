"use client";
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

function StartAptitudeTest({params}) {
    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        GetTestDetails();
    }, []);

    const GetTestDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/aptitude/${params.mockId}`);
            if (!res.ok) {
                console.error('Failed to fetch aptitude test', await res.text());
                setLoading(false);
                return;
            }
            const result = await res.json();
            if (result) {
                setTestData(result);
                // Generate fresh questions each time instead of using stored ones
                await generateFreshQuestions(result.topic, result.difficulty);
            }
        } catch (err) {
            console.error('Error fetching aptitude test:', err);
            setLoading(false);
        }
    }

    const generateFreshQuestions = async (topic, difficulty) => {
        try {
            const res = await fetch("/api/generateAptitude", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, difficulty }),
            });

            if (!res.ok) {
                console.error('Failed to generate questions', await res.text());
                setLoading(false);
                return;
            }

            const { rawText } = await res.json();
            try {
                const parsed = JSON.parse(rawText);
                setQuestions(parsed);
            } catch (e) {
                console.error("Failed to parse generated questions", e);
            }
        } catch (err) {
            console.error('Error generating aptitude questions:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleOptionSelect = (option) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [activeQuestionIndex]: option
        });
    };

    const handleNext = () => {
        if (activeQuestionIndex < questions.length - 1) {
            setActiveQuestionIndex(activeQuestionIndex + 1);
        }
    };

    const handleSubmit = () => {
        // We pass answers via localStorage for the feedback page to read them
        localStorage.setItem(`aptitude_answers_${params.mockId}`, JSON.stringify(selectedAnswers));
        localStorage.setItem(`aptitude_questions_${params.mockId}`, JSON.stringify(questions));
        router.replace(`/dashboard/aptitude/${params.mockId}/feedback`);
    };

    if (loading) return (
        <div className="p-10 text-center">
            <LoaderCircle className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Generating fresh questions...</p>
        </div>
    );

    if (!questions || questions.length === 0) return <div className="p-10 text-muted-foreground">Loading Test...</div>;

    const currentQuestion = questions[activeQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto p-10">
            <h2 className="text-3xl font-bold mb-2">Aptitude Test: <span className="text-black">{testData?.topic}</span></h2>
            <h3 className="text-sm font-medium text-black mb-8">Difficulty: {testData?.difficulty} | Question {activeQuestionIndex + 1} of {questions.length}</h3>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
                <h2 className="text-xl font-medium mb-8 text-foreground">{currentQuestion?.Question}</h2>
                <div className="flex flex-col gap-4">
                    {currentQuestion?.Options?.map((option, index) => (
                        <div 
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAnswers[activeQuestionIndex] === option ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm' : 'border-border hover:bg-secondary/50 text-foreground'}`}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between mt-10">
                <Button 
                    variant="outline" 
                    disabled={activeQuestionIndex === 0}
                    onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                >
                    Previous
                </Button>
                
                {activeQuestionIndex < questions.length - 1 ? (
                    <Button onClick={handleNext} disabled={!selectedAnswers[activeQuestionIndex]}>
                        Next Question
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length < questions.length} className="bg-primary text-primary-foreground">
                        Submit Test
                    </Button>
                )}
            </div>
        </div>
    )
}

export default StartAptitudeTest;
