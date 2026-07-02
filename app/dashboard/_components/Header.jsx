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
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-peach to-mint dark:from-blue-700 dark:to-orange-700 rounded-full animate-pulse"></div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserButtonLoaded(true);
    }, 1000);

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
    { href: "/dashboard/aptitude", label: "Aptitude Test" },
    { href: "/dashboard/question", label: "Questions" },
    { href: "/dashboard/howit", label: "How it works?" },
    { href: "/dashboard/chatbot", label: "Chatbot" },
    { href: "/dashboard/contact", label: "Contact" },
  ];

  const isActive = (href) => path === href;

  return (
    <div className="glass-effect border-b border-peach dark:border-strawberry-dark sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex gap-2 sm:gap-4 items-center justify-between">
        {/* Logo */}
        <Link className="flex-shrink-0" href="/dashboard">
          <div className="flex items-center gap-2 group">
            <Image src="/logo-light.png" width={45} height={45} alt="logo" className="w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] group-hover:scale-110 smooth-transition dark:hidden" />
            <Image src="/logo-dark.png" width={45} height={45} alt="logo" className="w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] group-hover:scale-110 smooth-transition hidden dark:block" />
            <div className="hidden md:block">
              <h1 className="font-bold text-lg lg:text-xl gradient-text">InterviewAI</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-200">Master Your Skills</p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-1 lg:gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <li className={`px-3 lg:px-4 py-2 rounded-lg smooth-transition font-medium text-sm lg:text-base ${isActive(item.href)
                ? 'bg-gradient-to-r from-strawberry to-salmon text-white shadow-lg shadow-salmon/40/30'
                : 'text-gray-700 dark:text-gray-100 hover:text-strawberry dark:hover:text-salmon'
                }`}>
                {item.label}
              </li>
            </Link>
          ))}
        </ul>

        {/* Right Section */}
        <div className="flex gap-2 sm:gap-3 items-center">
          {/* Admin Link */}
          {isAdminUser && (
            <Link href="/admin">
              <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:from-indigo-500/30 hover:to-purple-500/30 smooth-transition text-xs sm:text-sm font-semibold">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </div>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 smooth-transition">
            {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Theme & User */}
          <div className="flex gap-2 sm:gap-3 items-center border-l border-peach dark:border-strawberry-dark pl-2 sm:pl-3">
            <ModeToggle />
            {isUserButtonLoaded ? <UserButton /> : <SkeletonLoader />}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-peach dark:border-strawberry-dark bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm animate-slide-in">
          <ul className="px-4 py-3 space-y-1 sm:space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <li className={`px-4 py-3 rounded-lg smooth-transition font-medium text-base ${isActive(item.href)
                  ? 'bg-gradient-to-r from-strawberry to-salmon text-white'
                  : 'text-gray-700 dark:text-gray-100 hover:bg-peach dark:hover:bg-orange-900/20'
                  }`}>
                  {item.label}
                </li>
              </Link>
            ))}
            {isAdminUser && (
              <Link href="/admin" onClick={() => setIsOpen(false)}>
                <li className="px-4 py-3 rounded-lg smooth-transition font-medium text-base text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </li>
              </Link>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Header;
