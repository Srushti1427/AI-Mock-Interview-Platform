"use client";
import React, { useState, useRef, useCallback } from "react";
import { useEffect } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const StartInterview = ({ params }) => {
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const retriesRef = useRef(0);
  const maxRetries = 8;

  const fetchInterview = useCallback(async () => {
    try {
      const res = await fetch(`/api/interviews/${params.interviewId}`);
      if (!res.ok) {
        console.error('Failed to fetch interview', await res.text());
        return null;
      }
      const record = await res.json();
      if (!record) {
        console.error('No interview found');
        return null;
      }
      return record;
    } catch (error) {
      console.error('Error loading interview:', error);
      return null;
    }
  }, [params.interviewId]);

  useEffect(() => {
    let cancelled = false;

    const loadWithRetry = async () => {
      setIsLoading(true);
      while (retriesRef.current < maxRetries && !cancelled) {
        const record = await fetchInterview();
        if (cancelled) return;

        if (record) {
          const jsonMockResp = JSON.parse(record.jsonMockResp || '[]');
          if (jsonMockResp.length > 0) {
            setMockInterviewQuestion(jsonMockResp);
            setInterviewData(record);
            setIsLoading(false);
            return;
          }
        }

        retriesRef.current += 1;
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      // Even after retries, set whatever we have
      const record = await fetchInterview();
      if (record && !cancelled) {
        const jsonMockResp = JSON.parse(record.jsonMockResp || '[]');
        setMockInterviewQuestion(jsonMockResp);
        setInterviewData(record);
      }
      if (!cancelled) setIsLoading(false);
    };

    loadWithRetry();
    return () => { cancelled = true; };
  }, [fetchInterview]);

  const handleNextQuestion = () => {
    if (activeQuestionIndex < mockInterviewQuestion?.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  const [endingInterview, setEndingInterview] = useState(false);
  const recordAnswerRef = useRef(null);

  const handleEndInterview = async () => {
    setEndingInterview(true);
    // Wait a moment for any pending auto-save to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    window.location.href = "/dashboard/interview/" + interviewData?.mockId + "/feedback";
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 my-10">
        {/* Question Section */}
        <QuestionSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
        />

        {/* Video/audio Recording */}
        <RecordAnswerSection
          ref={recordAnswerRef}
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
          onAnswerSaved={(nextQuestion) => {
            if (nextQuestion && mockInterviewQuestion.length < 5) {
              setMockInterviewQuestion(prev => [...prev, nextQuestion]);
            }
          }}
        />
      </div>
      <div className="flex gap-3 my-5 md:my-0 md:justify-end md:gap-6">
        {activeQuestionIndex > 0 && (
          <Button
            onClick={handlePreviousQuestion}
          >
            Previous Question
          </Button>
        )}
        {activeQuestionIndex != mockInterviewQuestion?.length - 1 && (
          <Button
            onClick={handleNextQuestion}
          >
            Next Question
          </Button>
        )}
        {activeQuestionIndex == mockInterviewQuestion?.length - 1 && mockInterviewQuestion?.length === 5 && (
          <Button
            onClick={handleEndInterview}
            disabled={endingInterview}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            {endingInterview ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving & Ending...
              </>
            ) : (
              "End Interview"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StartInterview;
