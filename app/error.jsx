"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-white">Something went wrong!</h2>
        <p className="text-sm text-slate-400">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 px-6 bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
