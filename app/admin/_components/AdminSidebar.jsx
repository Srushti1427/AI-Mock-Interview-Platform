"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  MessageSquare,
  ArrowLeft,
  Shield,
  BookOpen,
} from "lucide-react";

const sidebarItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
  { href: "/admin/interviews", label: "Interviews", icon: MessageSquare },
  { href: "/admin/aptitude", label: "Aptitude Tests", icon: BookOpen },
];

const AdminSidebar = () => {
  const path = usePathname();

  const isActive = (href) => {
    if (href === "/admin") return path === "/admin";
    return path.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-indigo-200 dark:border-indigo-500/20 flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-indigo-200 dark:border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">Admin Panel</h1>
            <p className="text-xs text-indigo-500 dark:text-indigo-300">InterviewAI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-white border border-indigo-300 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all ${
                    active
                      ? "text-indigo-500 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="p-4 border-t border-indigo-200 dark:border-indigo-500/20">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/5 transition-all duration-200 group">
            <ArrowLeft className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all" />
            <span className="font-medium text-sm">Back to Dashboard</span>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
