"use client";
import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../_components/AdminLayoutClient";
import ActivityFeed from "../_components/ActivityFeed";
import { Activity, Filter } from "lucide-react";

const actionFilters = [
  { value: "", label: "All Actions" },
  { value: "login", label: "Logins" },
  { value: "interview_created", label: "Interviews Created" },
  { value: "feedback_submitted", label: "Feedback Submitted" },
  { value: "aptitude_created", label: "Aptitude Created" },
];

const AdminActivity = () => {
  const { userEmail } = useContext(AdminContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          email: userEmail,
          page: page.toString(),
          limit: "20",
        });
        if (actionFilter) params.set("action", actionFilter);
        if (emailFilter) params.set("userEmail", emailFilter);

        const res = await fetch(`/api/admin/activity?${params}`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchActivity();
  }, [userEmail, page, actionFilter, emailFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          Activity Log
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Track all user actions on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-all"
          >
            {actionFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={emailFilter}
          onChange={(e) => {
            setEmailFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by email..."
          className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-all w-64"
        />
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6">
        <ActivityFeed activities={activities} loading={loading} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-indigo-400 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400 dark:text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-indigo-400 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminActivity;
