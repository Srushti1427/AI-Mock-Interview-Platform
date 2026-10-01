"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { Menu, X, Shield } from "lucide-react";

const Header = () => {
  const [isUserButtonLoaded, setUserButtonLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { user } = useUser();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const SkeletonLoader = () => (
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse"></div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserButtonLoaded(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      const checkAdmin = async () => {
        try {
          const res = await fetch(
            `/api/admin/stats?email=${encodeURIComponent(
              user.primaryEmailAddress.emailAddress
            )}`
          );
          setIsAdminUser(res.ok);
        } catch {
          setIsAdminUser(false);
        }
      };
      checkAdmin();
    }
  }, [user]);

  const path = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/performance", label: "Activity" },
    { href: "/dashboard/aptitude", label: "Aptitude" },
    { href: "/dashboard/question", label: "Questions" },
    { href: "/dashboard/chatbot", label: "Chatbot" },
    { href: "/dashboard/contact", label: "Contact" },
  ];

  const isActive = (href) => path === href;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link className="flex-shrink-0" href="/dashboard">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <Image 
              src="/logo-light.png" 
              width={36} 
              height={36} 
              alt="logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 dark:hidden" 
            />
            <Image 
              src="/logo-dark.png" 
              width={36} 
              height={36} 
              alt="logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 hidden dark:block" 
            />
            <div className="hidden sm:block leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">InterviewAI</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200/80 dark:border-slate-700/80">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex items-center">
                <span className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center justify-center leading-none ${
                  active
                    ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-semibold shadow-sm border border-gray-200/80 dark:border-slate-700/80"
                    : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Link */}
          {isAdminUser && (
            <Link href="/admin">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </Link>
          )}

          {/* Theme Toggle & User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
            <ModeToggle />
            {isUserButtonLoaded ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SkeletonLoader />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleMenu} 
            className="md:hidden p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <div className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    active
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {isAdminUser && (
              <Link href="/admin" onClick={() => setIsOpen(false)}>
                <div className="px-3.5 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                  <Shield size={16} />
                  <span>Admin Panel</span>
                </div>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
