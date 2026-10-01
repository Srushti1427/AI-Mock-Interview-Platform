"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PerformanceDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeChartTab, setActiveChartTab] = useState("scores");
  const [activityFilter, setActivityFilter] = useState("all");
  const [hoveredDay, setHoveredDay] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) {
        throw new Error("Failed to load dashboard statistics");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err.message || "Something went wrong while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center py-16">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Performance Data</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
        <Button onClick={fetchDashboardStats} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  const { summary, calendar, analytics, recentActivity, achievements, progress, insights } = data || {};

  const filteredActivities = (recentActivity || []).filter((item) => {
    if (activityFilter === "all") return true;
    if (activityFilter === "interview") return item.type === "interview";
    if (activityFilter === "aptitude") return item.type === "aptitude";
    if (activityFilter === "question") return item.type === "question";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 pt-2">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
            Analytics & Activity
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Performance Overview
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Track preparation progress, activity consistency, test accuracy, and evaluation history.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-xs text-gray-600 dark:text-slate-400 font-medium px-3.5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            Current streak: <span className="font-bold text-gray-900 dark:text-white">{summary?.currentStreak || 0} days</span>
            <span className="text-gray-400 dark:text-slate-500 ml-1.5">| Longest: {summary?.longestStreak || 0}d</span>
          </div>

          <button
            onClick={fetchDashboardStats}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-lg border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="ACTIVE DAYS"
          value={summary?.activeDays || 0}
          detail="Unique practice days"
        />
        <MetricCard
          label="INTERVIEWS"
          value={summary?.totalInterviews || 0}
          detail="Mock sessions completed"
        />
        <MetricCard
          label="TESTS ATTEMPTED"
          value={summary?.totalAptitudeTests || 0}
          detail="Aptitude assessments"
        />
        <MetricCard
          label="QUESTIONS"
          value={summary?.totalQuestionsPracticed || 0}
          detail="Total questions solved"
        />
        <MetricCard
          label="AVG INTERVIEW SCORE"
          value={summary?.avgInterviewScore || "N/A"}
          detail="Rating out of 10.0"
        />
        <MetricCard
          label="AVG APTITUDE SCORE"
          value={summary?.avgAptitudeScore || "N/A"}
          detail="Test accuracy rate"
        />
        <MetricCard
          label="PRACTICE STREAK"
          value={`${summary?.currentStreak || 0} Days`}
          detail={`Longest: ${summary?.longestStreak || 0} days`}
        />
        <MetricCard
          label="PRACTICE TIME"
          value={summary?.totalPracticeTime || "0m"}
          detail="Estimated preparation"
        />
      </div>

      {/* 3. ACTIVITY CALENDAR */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Activity Calendar</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Daily practice volume for the past 12 months</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-900" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-1 scrollbar-thin">
          <div className="min-w-[720px]">
            {/* Month labels */}
            <div className="flex text-[11px] text-gray-400 dark:text-slate-500 mb-1.5 pl-7">
              {getCalendarMonthLabels(calendar).map((m, i) => (
                <div key={i} style={{ width: `${m.widthPx}px` }}>
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex gap-1 items-start">
              {/* Day labels */}
              <div className="flex flex-col gap-1 text-[10px] text-gray-400 dark:text-slate-500 pr-1.5 pt-0.5 select-none font-medium">
                <span className="h-3 flex items-center">Mon</span>
                <span className="h-3 flex items-center">Wed</span>
                <span className="h-3 flex items-center">Fri</span>
              </div>

              {/* Weeks */}
              <div className="flex gap-1 flex-1">
                {groupCalendarByWeeks(calendar).map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-1">
                    {week.map((day, dIndex) => {
                      if (!day) return <div key={dIndex} className="w-3 h-3" />;
                      const levelClass =
                        day.level === 0
                          ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-800"
                          : day.level === 1
                          ? "bg-emerald-200 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800"
                          : day.level === 2
                          ? "bg-emerald-400 dark:bg-emerald-700 border-emerald-500"
                          : "bg-emerald-600 dark:bg-emerald-500 border-emerald-600";

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3 h-3 rounded-sm border cursor-pointer transition-colors ${levelClass}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Tooltip Footer */}
        <div className="h-6 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 pt-1">
          {hoveredDay ? (
            <div>
              <span className="font-semibold text-gray-900 dark:text-white mr-2">{hoveredDay.date}:</span>
              <span>
                {hoveredDay.count === 0 ? "No activity recorded" : `${hoveredDay.count} activity item(s)`}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-slate-500">
              Hover over calendar squares to inspect daily activity count.
            </span>
          )}
        </div>
      </div>

      {/* 4. PERFORMANCE ANALYTICS (Charts & Categories) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Score trends and activity distribution</p>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab("scores")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeChartTab === "scores"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm font-semibold"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Scores Over Time
            </button>
            <button
              onClick={() => setActiveChartTab("volume")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeChartTab === "volume"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm font-semibold"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Monthly Volume
            </button>
            <button
              onClick={() => setActiveChartTab("categories")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeChartTab === "categories"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm font-semibold"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Category Breakdown
            </button>
          </div>
        </div>

        {activeChartTab === "scores" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                  Interview Rating (out of 10)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Aptitude Score (%)
                </span>
              </div>
              <span>Recent 15 sessions</span>
            </div>

            <LineChartAnalytics
              interviewScores={analytics?.interviewScoresOverTime || []}
              aptitudeScores={analytics?.aptitudeScoresOverTime || []}
            />
          </div>
        )}

        {activeChartTab === "volume" && (
          <div className="space-y-4">
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Total activities completed per month (Last 6 months)
            </div>
            <BarChartAnalytics monthlyData={analytics?.monthlyActivity || []} />
          </div>
        )}

        {activeChartTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Questions Practiced by Category
              </h3>
              <CategoryBreakdownList categories={analytics?.questionsByCategory || []} />
            </div>

            <div className="p-5 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Technical vs HR Performance
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Technical Avg</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics?.technicalVsHr?.techAvg || "N/A"}
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    {analytics?.technicalVsHr?.techCount || 0} sessions
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="text-xs text-gray-500 dark:text-slate-400">HR & Behavioral Avg</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics?.technicalVsHr?.hrAvg || "N/A"}
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    {analytics?.technicalVsHr?.hrCount || 0} sessions
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Technical scores evaluate problem-solving precision, while HR scores evaluate behavioral response structure.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. YOUR INSIGHTS (Minimal & Text-Focused) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Your Insights</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">Data-driven summary of strengths and target areas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightBox
            label="STRONGEST AREA"
            value={insights?.strongestArea || "Technical Concepts"}
            description={insights?.strongestDetail || "Steady score consistency across technical questions."}
          />
          <InsightBox
            label="NEEDS ATTENTION"
            value={insights?.weakestArea || "Behavioral HR Practice"}
            description={insights?.weakestDetail || "Focus on structuring answers using the STAR framework."}
          />
          <InsightBox
            label="RECENT IMPROVEMENT"
            value={insights?.recentImprovement || "Practice Consistency"}
            description="Positive score progression across recent evaluation sessions."
          />
          <InsightBox
            label="RECOMMENDED NEXT STEP"
            value={insights?.recommendedArea || "Mock Interview Session"}
            description="Take a fresh mock interview to evaluate your latest progress."
          />
          <InsightBox
            label="STREAK STATUS"
            value={
              insights?.currentStreak > 0
                ? `${insights.currentStreak}-Day Practice Streak`
                : "No Active Streak"
            }
            description="Maintain regular daily practice sessions to build long-term retention."
          />
          <InsightBox
            label="SUGGESTED DAILY GOAL"
            value={insights?.suggestedDailyGoal || "Complete 1 Mock & 5 Questions"}
            description="Targeted daily preparation steps."
          />
        </div>
      </div>

      {/* 6. PROGRESS SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Progress Breakdown</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">Completion estimates calculated from activity history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProgressRow
            label="Mock Interview Preparation"
            percentage={progress?.interviewPrep || 0}
            detail={`${summary?.totalInterviews || 0} completed`}
          />
          <ProgressRow
            label="Aptitude & Quantitative Math"
            percentage={progress?.aptitudePrep || 0}
            detail={`${summary?.totalAptitudeTests || 0} tests attempted`}
          />
          <ProgressRow
            label="Technical Core Topics"
            percentage={progress?.technicalTopic || 0}
            detail="Evaluated technical responses"
          />
          <ProgressRow
            label="HR & Behavioral Readiness"
            percentage={progress?.hrPrep || 0}
            detail="Evaluated behavioral answers"
          />
          <ProgressRow
            label="Data Structures & Algorithms"
            percentage={progress?.dsaCoding || 0}
            detail="Coding simulation practice"
          />
        </div>
      </div>

      {/* 7. ACHIEVEMENTS SECTION (Understated Rows) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Milestones</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Automatic achievement verification</p>
          </div>
          <div className="text-xs font-medium text-gray-500 dark:text-slate-400">
            {(achievements || []).filter((a) => a.unlocked).length} / {(achievements || []).length} Completed
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {(achievements || []).map((badge) => (
            <div key={badge.id} className="py-3 flex items-center justify-between text-xs sm:text-sm gap-4">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{badge.title}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{badge.description}</div>
              </div>
              <div className="shrink-0 text-right">
                {badge.unlocked ? (
                  <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Completed
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                    {badge.progress}% ({badge.targetText})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. RECENT ACTIVITY TIMELINE */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Activity Log</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Latest completed tests, interviews, and answers</p>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium self-start sm:self-auto">
            {["all", "interview", "aptitude", "question"].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setActivityFilter(filterKey)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  activityFilter === filterKey
                    ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 dark:text-slate-400">
            No activity records found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                      {act.type}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white truncate">{act.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{act.subtitle}</div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {act.score && (
                    <span className="font-semibold text-gray-900 dark:text-white">{act.score}</span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-slate-500 hidden sm:inline">{act.date}</span>
                  {act.link && (
                    <Link href={act.link} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* MINIMAL SUB-COMPONENTS */

function MetricCard({ label, value, detail }) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-1">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-400 dark:text-slate-500">{detail}</div>
    </div>
  );
}

function InsightBox({ label, value, description }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 space-y-1">
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-sm font-bold text-gray-900 dark:text-white">{value}</div>
      <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function ProgressRow({ label, percentage, detail }) {
  return (
    <div className="space-y-1.5 p-3.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex justify-between text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
        <span>{label}</span>
        <span className="text-gray-600 dark:text-slate-400 font-bold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {detail && <div className="text-[11px] text-gray-400 dark:text-slate-500">{detail}</div>}
    </div>
  );
}

/* CLEAN SVG CHARTS */

function LineChartAnalytics({ interviewScores, aptitudeScores }) {
  if (interviewScores.length === 0 && aptitudeScores.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-slate-800 rounded-lg text-xs text-gray-500 dark:text-slate-400">
        No evaluation score data available to render chart.
      </div>
    );
  }

  const pointsInt = interviewScores.map((item, idx) => ({
    x: idx,
    val: item.score * 10,
    label: `${item.score}/10`,
    title: item.question,
  }));

  const pointsApt = aptitudeScores.map((item, idx) => ({
    x: idx,
    val: item.score,
    label: `${item.score}%`,
    title: item.topic,
  }));

  const maxPoints = Math.max(pointsInt.length, pointsApt.length, 5);

  const getSvgCoords = (pts) => {
    if (pts.length === 0) return "";
    return pts
      .map((p, i) => {
        const xPx = (i / (maxPoints - 1 || 1)) * 620 + 35;
        const yPx = 180 - (p.val / 100) * 140;
        return `${xPx},${yPx}`;
      })
      .join(" ");
  };

  return (
    <div className="overflow-x-auto">
      <svg className="w-full h-56 min-w-[500px]" viewBox="0 0 680 210">
        {[0, 25, 50, 75, 100].map((val) => {
          const yPx = 180 - (val / 100) * 140;
          return (
            <g key={val}>
              <line x1="35" y1={yPx} x2="660" y2={yPx} stroke="currentColor" className="text-gray-200 dark:text-slate-800" strokeDasharray="2 2" />
              <text x="25" y={yPx + 3} textAnchor="end" className="text-[10px] fill-gray-400 dark:fill-slate-500">
                {val}%
              </text>
            </g>
          );
        })}

        {pointsInt.length > 1 && (
          <polyline
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={getSvgCoords(pointsInt)}
          />
        )}

        {pointsApt.length > 1 && (
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={getSvgCoords(pointsApt)}
          />
        )}

        {pointsInt.map((p, i) => {
          const xPx = (i / (maxPoints - 1 || 1)) * 620 + 35;
          const yPx = 180 - (p.val / 100) * 140;
          return (
            <circle
              key={`int_${i}`}
              cx={xPx}
              cy={yPx}
              r="4"
              className="fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-2"
            >
              <title>{`Interview: ${p.label} - ${p.title}`}</title>
            </circle>
          );
        })}

        {pointsApt.map((p, i) => {
          const xPx = (i / (maxPoints - 1 || 1)) * 620 + 35;
          const yPx = 180 - (p.val / 100) * 140;
          return (
            <circle
              key={`apt_${i}`}
              cx={xPx}
              cy={yPx}
              r="4"
              className="fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-2"
            >
              <title>{`Aptitude: ${p.label} - ${p.title}`}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

function BarChartAnalytics({ monthlyData }) {
  if (!monthlyData || monthlyData.length === 0) return null;
  const maxVal = Math.max(...monthlyData.map((m) => m.total), 5);

  return (
    <div className="h-52 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-gray-200 dark:border-slate-800">
      {monthlyData.map((m, i) => {
        const heightPct = Math.max(6, Math.round((m.total / maxVal) * 100));
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
            <span className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
              {m.total}
            </span>
            <div
              className="w-full max-w-[36px] bg-indigo-600 dark:bg-indigo-500 rounded-t transition-all"
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-[11px] text-gray-500 dark:text-slate-400 truncate max-w-[60px] text-center">
              {m.month.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBreakdownList({ categories }) {
  const maxCount = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div className="space-y-2.5">
      {categories.map((item, idx) => {
        const pct = Math.round((item.count / maxCount) * 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-gray-900 dark:text-slate-200">
              <span>{item.category}</span>
              <span className="text-gray-500 dark:text-slate-400">{item.count} items</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* HELPER FUNCTIONS */

function getCalendarMonthLabels(calendarDays = []) {
  if (calendarDays.length === 0) return [];
  const labels = [];
  let currentMonth = "";
  let widthCounter = 0;

  calendarDays.forEach((day, i) => {
    if (i % 7 === 0) {
      if (day.month !== currentMonth) {
        if (currentMonth !== "") {
          labels.push({ label: currentMonth, widthPx: widthCounter * 13 });
        }
        currentMonth = day.month;
        widthCounter = 1;
      } else {
        widthCounter++;
      }
    }
  });
  if (currentMonth !== "") {
    labels.push({ label: currentMonth, widthPx: widthCounter * 13 });
  }
  return labels;
}

function groupCalendarByWeeks(calendarDays = []) {
  if (calendarDays.length === 0) return [];
  const weeks = [];
  let currentWeek = [];

  calendarDays.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  return weeks;
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse p-4">
      <div className="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-gray-100 dark:bg-slate-800 rounded-xl" />
      <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}
