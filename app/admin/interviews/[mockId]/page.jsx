"use client";
import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../../_components/AdminLayoutClient";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";

const InterviewTranscript = () => {
  const { userEmail } = useContext(AdminContext);
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const res = await fetch(
          `/api/admin/interviews/${params.mockId}?email=${encodeURIComponent(
            userEmail
          )}`
        );
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to fetch transcript:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail && params.mockId) fetchTranscript();
  }, [userEmail, params.mockId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-48" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-60 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Interview Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          This interview may have been deleted or doesn't exist.
        </p>
        <button
          onClick={() => router.push("/admin/interviews")}
          className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-all text-sm font-medium"
        >
          Back to Interviews
        </button>
      </div>
    );
  }

  const { interview, transcript, stats } = data;

  const getRatingColor = (rating) => {
    const r = parseFloat(rating);
    if (r >= 8) return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30";
    if (r >= 5) return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30";
    if (r > 0) return "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/30";
    return "text-slate-500 bg-slate-100 dark:bg-slate-500/20 border-slate-200 dark:border-slate-500/30";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/interviews")}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Interviews
      </button>

      {/* Interview Header */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              {interview.jobPosition}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {stats.userEmail}
              </span>
              <span>{interview.jobExperience} years exp</span>
              <span>{interview.createdAt}</span>
            </div>
            {interview.jobDesc && (
              <p className="mt-3 text-sm text-slate-400 dark:text-slate-500 max-w-xl">
                {interview.jobDesc}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.totalQuestions}
              </p>
              <p className="text-xs text-slate-500">Questions</p>
            </div>
            <div className="text-center px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.answeredCount}
              </p>
              <p className="text-xs text-slate-500">Answered</p>
            </div>
            <div className="text-center px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.avgRating || "—"}
              </p>
              <p className="text-xs text-slate-500">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Interview Transcript
        </h2>

        {transcript.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden"
          >
            {/* Question Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  {item.index}
                </span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">
                  Question {item.index}
                </span>
              </div>
              {item.rating && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getRatingColor(
                    item.rating
                  )}`}
                >
                  <Star className="w-3 h-3" />
                  {item.rating}/10
                </span>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Question */}
              <div>
                <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                  Question
                </p>
                <p className="text-slate-800 dark:text-white text-sm leading-relaxed">
                  {item.question}
                </p>
              </div>

              {/* Expected Answer */}
              {item.expectedAnswer && (
                <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Expected Answer
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {item.expectedAnswer}
                  </p>
                </div>
              )}

              {/* User Answer */}
              <div
                className={`rounded-xl p-4 ${
                  item.userAnswer
                    ? "bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20"
                    : "bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/30"
                }`}
              >
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  User's Answer
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {item.userAnswer || (
                    <span className="italic text-slate-400 dark:text-slate-600">
                      No answer provided
                    </span>
                  )}
                </p>
              </div>

              {/* AI Feedback */}
              {item.feedback && (
                <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    AI Feedback
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {item.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewTranscript;
