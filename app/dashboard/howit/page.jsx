import React from 'react';
import Contect from '@/app/_components/Contect';
import Link from 'next/link';

const HowItWorks = () => {
  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col justify-between pt-4 pb-4">
      <div className="pb-8">
        <Contect />
      </div>

      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-6 px-4 sm:px-6 border border-gray-200 dark:border-slate-800 text-xs sm:text-sm rounded-2xl shadow-sm mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-200">
              © 2026 InterviewAI. All rights reserved.
            </p>
            <p className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">
              Crafted with Passion by SRUSHTI KISAN SHIVANWAR
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
              Placement & Interview Preparation System
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium text-xs sm:text-sm">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Overview
            </Link>
            <Link href="/#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/dashboard/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
