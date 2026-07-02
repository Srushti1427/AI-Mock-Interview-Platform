"use client";
import React, { createContext, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ModeToggle";
import { Menu, X } from "lucide-react";

export const AdminContext = createContext();

const AdminLayoutClient = ({ children, userEmail }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminContext.Provider value={{ userEmail }}>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64">
              <AdminSidebar />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-indigo-200 dark:border-indigo-500/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all"
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Admin Dashboard
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
                  {userEmail}
                </span>
                <div className="flex gap-3 items-center border-l border-indigo-200 dark:border-slate-700 pl-3">
                  <ModeToggle />
                  <UserButton />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
};

export default AdminLayoutClient;
