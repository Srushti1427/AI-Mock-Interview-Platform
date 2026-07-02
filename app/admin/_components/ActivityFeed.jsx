"use client";
import React from "react";
import { LogIn, MessageSquare, BookOpen, Star } from "lucide-react";

const actionConfig = {
  login: {
    icon: LogIn,
    label: "Logged in",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-500/20",
    border: "border-blue-200 dark:border-blue-500/30",
  },
  interview_created: {
    icon: MessageSquare,
    label: "Created interview",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  aptitude_created: {
    icon: BookOpen,
    label: "Created aptitude test",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-500/20",
    border: "border-purple-200 dark:border-purple-500/30",
  },
  feedback_submitted: {
    icon: Star,
    label: "Submitted feedback",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-500/20",
    border: "border-amber-200 dark:border-amber-500/30",
  },
};

const ActivityFeed = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-slate-500">
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, idx) => {
        const config = actionConfig[activity.action] || actionConfig.login;
        const Icon = config.icon;

        return (
          <div
            key={activity._id || idx}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            {/* Avatar or Icon */}
            <div className="flex-shrink-0">
              {activity.avatarUrl ? (
                <img
                  src={activity.avatarUrl}
                  alt={activity.name || activity.email}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-800 dark:text-white font-medium truncate">
                  {activity.name || activity.email}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} ${config.border} border font-medium`}
                >
                  {config.label}
                </span>
              </div>
              {activity.metadata?.jobPosition && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  {activity.metadata.jobPosition}
                </p>
              )}
            </div>

            {/* Timestamp */}
            <span className="text-xs text-slate-400 dark:text-slate-600 flex-shrink-0">
              {activity.createdAt}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
