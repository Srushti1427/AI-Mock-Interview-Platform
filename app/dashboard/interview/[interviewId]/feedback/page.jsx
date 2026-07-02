"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const Feedback = ({ params }) => {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    try {
      const res = await fetch(`/api/user-answers/${params.interviewId}`);
      if (!res.ok) {
        console.error('Failed to fetch user answers', await res.text());
        setLoadingFeedback(false);
        return;
      }
      const result = await res.json();
      console.log(result);
      setFeedbackList(result);

      // Generate overall feedback
      if (result && result.length > 0) {
        await generateOverallFeedback();
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setLoadingFeedback(false);
    }
  };

  const generateOverallFeedback = async () => {
    try {
      const res = await fetch("/api/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockId: params.interviewId }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Error generating feedback:", error);
        return;
      }

      const data = await res.json();
      if (data.feedback) {
        setOverallFeedback(data.feedback);
      }
    } catch (error) {
      console.error("Error generating overall feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const overallRating = useMemo(() => {
    if (feedbackList && feedbackList.length > 0) {
      const totalRating = feedbackList.reduce(
        (sum, item) => sum + Number(item.rating),
        0
      );
      return (totalRating / feedbackList.length).toFixed(1);
    }
    return 0;
  }, [feedbackList]);

  return (
    <div className="p-10">
      {feedbackList?.length == 0 ? (
        <h2 className="font-bold text-xl text-gray-500 my-5">
          No Interview feedback Record Found
        </h2>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-green-500">Congratulations!</h2>
          <h2 className="font-bold text-2xl mb-6">Here is your interview feedback</h2>
          
          {/* Overall Rating */}
          <h2 className="text-primary dark:text-blue-300 text-lg my-3">
            Your overall interview rating{" "}
            <strong
              className={`${
                overallRating >= 5 ? "text-green-500" : "text-red-600"
              }`}
            >
              {overallRating}
              <span className="text-black dark:text-white">/10</span>
            </strong>
          </h2>

          {/* AI Generated Overall Feedback */}
          {loadingFeedback ? (
            <div className="my-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-salmon-dark" />
                <p className="text-orange-700 font-semibold">Generating AI feedback to help you improve...</p>
              </div>
            </div>
          ) : overallFeedback ? (
            <div className="my-8 bg-gradient-to-r from-blue-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-2 border-peach dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-strawberry dark:text-white mb-4">AI Coach Assessment & Improvement Plan</h2>
              
              {/* Overall Analysis */}
              <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-lg border-l-4 border-blue-900 dark:border-blue-500">
                <h3 className="font-bold text-strawberry dark:text-blue-300 mb-2 text-lg">📊 Performance Analysis</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{overallFeedback.overallAnalysis}</p>
              </div>

              {/* Key Mistakes */}
              {overallFeedback.keyMistakes && overallFeedback.keyMistakes.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-orange-600 dark:border-red-500">
                  <h3 className="font-bold text-orange-800 dark:text-red-400 mb-3 text-lg">❌ Key Mistakes to Avoid</h3>
                  <ul className="space-y-2">
                    {overallFeedback.keyMistakes.map((mistake, idx) => (
                      <li key={idx} className="text-orange-700 dark:text-red-200 flex gap-2">
                        <span className="font-bold">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {overallFeedback.improvements && overallFeedback.improvements.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border-l-4 border-blue-900 dark:border-green-500">
                  <h3 className="font-bold text-strawberry dark:text-green-400 mb-3 text-lg">✅ Areas to Improve</h3>
                  <ul className="space-y-2">
                    {overallFeedback.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-blue-700 dark:text-green-200 flex gap-2">
                        <span className="font-bold">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {overallFeedback.actionItems && overallFeedback.actionItems.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border-l-4 border-orange-600 dark:border-yellow-500">
                  <h3 className="font-bold text-orange-800 dark:text-yellow-400 mb-3 text-lg">🎯 Action Items for Your Next Interview</h3>
                  <ol className="space-y-2">
                    {overallFeedback.actionItems.map((item, idx) => (
                      <li key={idx} className="text-orange-700 dark:text-yellow-200 flex gap-2">
                        <span className="font-bold">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ) : null}

          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-10 mb-4">
            📋 Question-by-Question Breakdown
          </h2>
          <h2 className="text-sm text-gray-600 dark:text-gray-300 mb-5">
            Find below interview questions with correct answers, your answers and detailed feedback for improvement
          </h2>
          
          {feedbackList &&
            feedbackList.map((item, index) => (
              <Collapsible key={index} className="mt-4">
                <CollapsibleTrigger className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800 border-2 border-orange-300 dark:border-slate-700 rounded-lg my-2 text-left flex justify-between gap-7 w-full hover:from-orange-100 hover:to-yellow-100 dark:hover:from-slate-700 dark:hover:to-slate-700 transition font-semibold text-gray-900 dark:text-white">
                  <span>Q{index + 1}: {item.question}</span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-3 mt-3 bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="p-4 border-l-4 border-salmon bg-orange-50 dark:bg-slate-800 rounded">
                      <h3 className="font-bold text-orange-900 dark:text-orange-400 mb-2">Rating:</h3>
                      <p className="text-2xl font-bold text-salmon-dark dark:text-salmon">{item.rating}/10</p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-slate-800 rounded">
                      <h3 className="font-bold text-red-900 dark:text-red-400 mb-2">Your Answer:</h3>
                      <p className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{item.userAns}</p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-slate-800 rounded">
                      <h3 className="font-bold text-green-900 dark:text-green-400 mb-2">Correct Answer:</h3>
                      <p className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{item.correctAns}</p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-slate-800 rounded">
                      <h3 className="font-bold text-strawberry dark:text-salmon mb-2">Feedback:</h3>
                      <p className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{item.feedback}</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </>
      )}

      <Button onClick={() => router.replace("/dashboard")} className="mt-8">
        Go Home
      </Button>
    </div>
  );
};

export default Feedback;
