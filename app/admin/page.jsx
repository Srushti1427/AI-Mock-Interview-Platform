"use client";
import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "./_components/AdminLayoutClient";
import StatsCard from "./_components/StatsCard";
import ActivityFeed from "./_components/ActivityFeed";
import { Users, MessageSquare, BookOpen, LogIn, TrendingUp, Activity } from "lucide-react";

const AdminOverview = () => {
  const { userEmail } = useContext(AdminContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/admin/stats?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchStats();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Loading platform analytics...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Monitor your platform's performance and user activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          subValue={`${stats?.loginsToday || 0} active today`}
          color="indigo"
        />
        <StatsCard
          icon={MessageSquare}
          label="Total Interviews"
          value={stats?.totalInterviews || 0}
          color="emerald"
        />
        <StatsCard
          icon={BookOpen}
          label="Aptitude Tests"
          value={stats?.totalAptitudeTests || 0}
          color="purple"
        />
        <StatsCard
          icon={LogIn}
          label="Logins This Week"
          value={stats?.loginsThisWeek || 0}
          subValue={`${stats?.loginsToday || 0} today`}
          color="amber"
        />
      </div>

      {/* Activity Chart */}
      {stats?.dailyActivity && (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            7-Day Activity Trend
          </h3>
          <div className="flex items-end gap-2 h-48">
            {stats.dailyActivity.map((day, idx) => {
              const total = day.logins + day.interviews + day.feedbacks;
              const maxTotal = Math.max(
                ...stats.dailyActivity.map(
                  (d) => d.logins + d.interviews + d.feedbacks
                ),
                1
              );
              const height = (total / maxTotal) * 100;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex flex-col items-center relative group">
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-xl">
                      <p className="font-semibold">{day.date}</p>
                      <p>Logins: {day.logins}</p>
                      <p>Interviews: {day.interviews}</p>
                      <p>Feedbacks: {day.feedbacks}</p>
                    </div>

                    {/* Bar */}
                    <div
                      className="w-full max-w-12 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 hover:from-indigo-500 hover:to-indigo-300 cursor-pointer"
                      style={{
                        height: `${Math.max(height, 4)}%`,
                        minHeight: "8px",
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(day.date).toLocaleDateString("en", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Recent Activity
        </h3>
        <ActivityFeed activities={stats?.recentActivity || []} />
      </div>
    </div>
  );
};

export default AdminOverview;
