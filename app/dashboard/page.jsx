"use client";

import React, { useState, useEffect } from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { ArrowUpRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useUser();
  const [greeting, setGreeting] = useState("Welcome");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    fetch("/api/dashboard/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .catch((err) => console.error("Error loading stats preview:", err));
  }, []);

  const displayName =
    user?.fullName ||
    user?.firstName ||
    (user?.primaryEmailAddress?.emailAddress
      ? user.primaryEmailAddress.emailAddress.split("@")[0]
      : "Developer");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 pt-2">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
            {greeting}, {displayName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Generate mock interviews, practice questions, and review historical performance.
          </p>
        </div>

        <Link href="/dashboard/performance">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <span>Full Performance Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* PERFORMANCE SNAPSHOT WIDGET */}
      {stats?.summary && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Performance Snapshot
              </h2>
            </div>
            <Link href="/dashboard/performance" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Detailed Dashboard →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                STREAK
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.summary.currentStreak} Days
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-500">Max: {stats.summary.longestStreak}d</div>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                INTERVIEWS
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.summary.totalInterviews}
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-500">Sessions completed</div>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                APTITUDE TESTS
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.summary.totalAptitudeTests}
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-500">Tests attempted</div>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                AVG SCORE
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.summary.avgInterviewScore}
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-500">Interview evaluation</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Action Area: Create Interview & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Create New Interview (1/3 width) */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Generate New Mock Interview
          </h2>
          <AddNewInterview />
        </div>

        {/* Interview History (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Interview History
          </h2>
          <InterviewList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
