"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { Skeleton } from "@/components/ui/skeleton"
import { History } from "lucide-react";

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.primaryEmailAddress?.emailAddress }),
      });
      if (!res.ok) {
        console.error('Failed to fetch interviews:', await res.text());
        setInterviewList([]);
        return;
      }
      const result = await res.json();
      setInterviewList(result);
    } catch (err) {
      console.error(err);
      setInterviewList([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 sm:h-80 rounded-2xl bg-gradient-to-br from-blue-100 to-orange-100 dark:from-strawberry dark:to-orange-900" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {interviewList && interviewList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 animate-fade-in">
          {interviewList.map((interview, index) => (
            <InterviewItemCard key={index} interview={interview} />
          ))}
        </div>
      ) : (
        <div className="glass-effect border-2 border-peach dark:border-strawberry-dark rounded-2xl p-8 sm:p-12 text-center animate-fade-in">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-strawberry to-salmon rounded-full flex items-center justify-center">
            <History className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-100 mb-2">No interviews yet</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-200">Create your first interview to get started</p>
        </div>
      )}
    </div>
  );
};

export default InterviewList;
