"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const GRADIENT_BTN_STYLE = {
  background: "linear-gradient(90deg, #05080B 0%, #365F87 100%)",
};

const SECONDARY_BTN_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#D9E0E7",
  color: "#0B1F33",
};

function AptitudeList({ refreshTrigger }) {
  const { user } = useUser();
  const [testList, setTestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    if (user) {
      GetTestList();
    }
  }, [user, refreshTrigger]);

  const GetTestList = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/aptitude");
      if (!res.ok) {
        console.error("Failed to fetch aptitude tests", await res.text());
        setTestList([]);
        return;
      }
      const data = await res.json();
      setTestList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTestList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = testList.filter((test) => {
    if (filterMode === "all") return true;
    if (filterMode === "completed") return test.isCompleted;
    if (filterMode === "practice") return test.mode === "practice";
    if (filterMode === "daily") return test.isDaily;
    return true;
  });

  return (
    <div className="space-y-4 text-[#0B1F33]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E0E7] dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold tracking-wider text-[#5A6E85] uppercase">
            Aptitude History
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Review past test results, accuracy scores, and detailed explanations.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-[14px] text-xs">
          {[
            { id: "all", label: "All" },
            { id: "completed", label: "Completed" },
            { id: "practice", label: "Practice" },
            { id: "daily", label: "Daily Challenge" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-[10px] font-medium transition-colors cursor-pointer ${
                filterMode === tab.id
                  ? "bg-white dark:bg-slate-900 text-[#0B1F33] dark:text-white shadow-none font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[14px] animate-pulse p-5" />
          ))}
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((test, index) => {
            const isCompleted = Boolean(test.isCompleted);
            const scorePct = test.percentage !== undefined
              ? test.percentage
              : test.score !== undefined && test.totalQuestions
              ? Math.round((test.score / test.totalQuestions) * 100)
              : null;

            return (
              <div
                key={test.mockId || index}
                className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-5 shadow-none flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-[#5A6E85]">
                      {test.category || test.topic || "Quantitative"}
                    </span>
                    <span className="text-slate-400">
                      {test.difficulty || "Medium"}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[#0B1F33] dark:text-white line-clamp-1">
                    {test.topic}
                  </h4>

                  <div className="text-xs text-slate-500 mt-1">
                    Date: {test.createdAt} • Mode: <span className="capitalize">{test.mode || "test"}</span>
                  </div>

                  {/* Score summary if completed */}
                  {isCompleted && scorePct !== null ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[10px] border border-[#D9E0E7] dark:border-slate-800 mt-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-slate-500 font-medium">Accuracy</div>
                        <div className="text-base font-bold text-[#0B1F33] dark:text-white">
                          {scorePct}% <span className="text-xs font-normal text-slate-500">({test.score}/{test.totalQuestions || 10})</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {scorePct >= 75 ? "Passed" : "Completed"}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[10px] border border-[#D9E0E7] dark:border-slate-800 mt-3 text-xs text-slate-500">
                      {test.questionCount || 10} questions test ready
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {isCompleted ? (
                    <>
                      <Link href={`/dashboard/aptitude/${test.mockId}/feedback`} className="w-full">
                        <button
                          style={SECONDARY_BTN_STYLE}
                          className="w-full border font-semibold text-xs py-2 rounded-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center cursor-pointer"
                        >
                          View Results
                        </button>
                      </Link>
                      <Link href={`/dashboard/aptitude/${test.mockId}/start`} className="w-full">
                        <button
                          style={GRADIENT_BTN_STYLE}
                          className="w-full text-white font-semibold text-xs py-2 rounded-[14px] hover:opacity-95 transition-opacity text-center cursor-pointer"
                        >
                          Retake
                        </button>
                      </Link>
                    </>
                  ) : (
                    <Link href={`/dashboard/aptitude/${test.mockId}/start`} className="w-full">
                      <button
                        style={GRADIENT_BTN_STYLE}
                        className="w-full text-white font-semibold text-xs py-2 rounded-[14px] hover:opacity-95 transition-opacity text-center cursor-pointer"
                      >
                        Start Test
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-8 text-center text-xs text-slate-500">
          No tests found matching this filter.
        </div>
      )}
    </div>
  );
}

export default AptitudeList;
