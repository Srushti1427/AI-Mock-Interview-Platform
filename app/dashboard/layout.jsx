"use client";
import React from "react";
import Header from "./_components/Header";
import { createContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export const WebCamContext = createContext();

const DashboardLayout = ({ children }) => {
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const { user } = useUser();

  // Track login once per session
  useEffect(() => {
    if (!user) return;
    const sessionKey = `login_tracked_${user.primaryEmailAddress?.emailAddress}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const trackLogin = async () => {
      try {
        await fetch("/api/track-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.firstName || "",
            avatarUrl: user.imageUrl || "",
          }),
        });
        sessionStorage.setItem(sessionKey, "true");
      } catch (err) {
        console.error("Login tracking failed:", err);
      }
    };

    trackLogin();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <WebCamContext.Provider value={{ webCamEnabled, setWebCamEnabled }}>
            {children}
          </WebCamContext.Provider>
        </div>
    </div>
  );
};

export default DashboardLayout;
