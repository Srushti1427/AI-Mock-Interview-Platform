"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Header = ({ logo }) => {
  const [isUserButtonLoaded, setUserButtonLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const SkeletonLoader = () => (
    <div className="w-8 h-8 bg-gradient-to-r from-peach to-mint dark:from-blue-700 dark:to-orange-700 rounded-full animate-pulse"></div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserButtonLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const path = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/aptitude", label: "Aptitude Test" },
    { href: "/dashboard/question", label: "Questions" },
    { href: "/dashboard/howit", label: "How it works?" },
    { href: "/dashboard/chatbot", label: "Chatbot" }
  ];

  const isActive = (href) => path === href;

  return (
    <div className="glass-effect border-b border-peach dark:border-strawberry-dark sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex gap-4 items-center justify-between">
        {/* Logo */}
        <Link className="flex-shrink-0" href="/dashboard">
          <div className="flex items-center gap-2 group">
            <Image src={logo} width={45} height={45} alt="logo" className="group-hover:scale-110 smooth-transition" />
            <div className="hidden md:block">
              <h1 className="font-bold text-lg gradient-text">InterviewAI</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Master Your Skills</p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <li className={`px-4 py-2 rounded-lg smooth-transition font-medium ${isActive(item.href)
                  ? 'bg-gradient-to-r from-strawberry to-salmon text-white shadow-lg shadow-salmon/40/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-strawberry dark:hover:text-salmon'
                }`}>
                {item.label}
              </li>
            </Link>
          ))}
        </ul>

        {/* Right Section */}
        <div className="flex gap-3 items-center">
          {/* Mobile Menu Toggle */}
          <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 smooth-transition">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Theme & User */}
          <div className="flex gap-3 items-center border-l border-peach dark:border-strawberry-dark pl-3">
            <ModeToggle />
            {isUserButtonLoaded ? <UserButton /> : <SkeletonLoader />}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-peach dark:border-strawberry-dark bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm animate-slide-in">
          <ul className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <li className={`px-4 py-2 rounded-lg smooth-transition font-medium ${isActive(item.href)
                    ? 'bg-gradient-to-r from-strawberry to-salmon text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-peach dark:hover:bg-orange-900/20'
                  }`}>
                  {item.label}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Header;
