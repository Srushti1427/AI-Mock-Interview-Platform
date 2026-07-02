"use client";
import React from "react";

const colorMap = {
  indigo: {
    bg: "from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/20 dark:to-indigo-600/10",
    border: "border-indigo-200 dark:border-indigo-500/30",
    icon: "from-indigo-500 to-indigo-600",
    text: "text-indigo-500 dark:text-indigo-400",
    shadow: "shadow-indigo-500/10 dark:shadow-indigo-500/20",
  },
  purple: {
    bg: "from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10",
    border: "border-purple-200 dark:border-purple-500/30",
    icon: "from-purple-500 to-purple-600",
    text: "text-purple-500 dark:text-purple-400",
    shadow: "shadow-purple-500/10 dark:shadow-purple-500/20",
  },
  emerald: {
    bg: "from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    icon: "from-emerald-500 to-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    shadow: "shadow-emerald-500/10 dark:shadow-emerald-500/20",
  },
  amber: {
    bg: "from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10",
    border: "border-amber-200 dark:border-amber-500/30",
    icon: "from-amber-500 to-amber-600",
    text: "text-amber-600 dark:text-amber-400",
    shadow: "shadow-amber-500/10 dark:shadow-amber-500/20",
  },
  rose: {
    bg: "from-rose-500/10 to-rose-600/5 dark:from-rose-500/20 dark:to-rose-600/10",
    border: "border-rose-200 dark:border-rose-500/30",
    icon: "from-rose-500 to-rose-600",
    text: "text-rose-500 dark:text-rose-400",
    shadow: "shadow-rose-500/10 dark:shadow-rose-500/20",
  },
  cyan: {
    bg: "from-cyan-500/10 to-cyan-600/5 dark:from-cyan-500/20 dark:to-cyan-600/10",
    border: "border-cyan-200 dark:border-cyan-500/30",
    icon: "from-cyan-500 to-cyan-600",
    text: "text-cyan-600 dark:text-cyan-400",
    shadow: "shadow-cyan-500/10 dark:shadow-cyan-500/20",
  },
};

const StatsCard = ({ icon: Icon, label, value, subValue, color = "indigo" }) => {
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${c.shadow}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${c.icon} rounded-xl flex items-center justify-center shadow-lg ${c.shadow}`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          {subValue && (
            <p className={`text-xs font-medium ${c.text}`}>{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
