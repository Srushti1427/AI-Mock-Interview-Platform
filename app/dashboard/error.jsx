"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Page Error Occurred</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {error?.message || "An error occurred while loading this section."}
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-2.5 px-5 bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-xs"
        >
          <RefreshCw size={14} />
          <span>Reload Page Section</span>
        </button>
      </div>
    </div>
  );
}
