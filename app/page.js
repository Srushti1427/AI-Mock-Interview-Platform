"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";
import Contect from "./_components/Contect";
import { ArrowRight, Menu, X, Check } from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#overview", label: "Overview" },
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#why-us", label: "Readiness" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-800 selection:text-white transition-colors duration-200 overflow-x-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/logo-light.png"
              width={36}
              height={36}
              alt="InterviewAI Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              width={36}
              height={36}
              alt="InterviewAI Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 hidden dark:block"
            />
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                InterviewAI
              </span>
              <span className="hidden lg:inline text-xs text-slate-500 dark:text-slate-400 font-medium border-l border-gray-300 dark:border-slate-700 pl-2">
                Placement & Interview Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200/80 dark:border-slate-700/80">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60 transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />
            <Link href="/dashboard">
              <button className="bg-[linear-gradient(90deg,#05080B_0%,#365F87_100%)] hover:opacity-95 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 sm:px-5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section id="overview" className="pt-10 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-3 sm:mb-4">
                  Placement & Career Preparation Platform
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.2]">
                  Practice Technical & Behavioral Interviews with Structured AI Feedback
                </h1>
              </div>

              <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-2xl">
                Generate custom job-role interviews, complete quantitative aptitude assessments, and receive immediate actionable feedback to refine your answers for placement rounds.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-[linear-gradient(90deg,#05080B_0%,#365F87_100%)] hover:opacity-95 text-white font-semibold text-sm px-6 py-3 rounded-lg sm:rounded-xl shadow-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer">
                    <span>Start Practice Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold text-sm px-6 py-3 rounded-lg sm:rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer">
                    Explore Features
                  </button>
                </a>
              </div>

              {/* Key Highlights Bar */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-800/80 grid grid-cols-3 gap-3 text-left">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Coverage</div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">Tech & HR Rounds</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Evaluation</div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">1–10 Scoring Rubric</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Modules</div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">Aptitude & Coding</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Sample Session Evaluation
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Full Stack Developer
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Intermediate
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Technical Depth</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">8.5 / 10</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Communication</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">9.0 / 10</div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Feedback Summary
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Clear conceptual explanation of asynchronous APIs and state handling.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Recommended adding explicit boundary case validation in logic explanations.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES SECTION */}
        <section id="features" className="py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200 dark:border-slate-800">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Platform Features
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Comprehensive Interview & Placement Tools
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Integrated modules designed to support students through technical screenings, behavioral evaluations, and aptitude tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                category: "Mock Interviews",
                title: "Role-Specific Questions",
                description: "Generates tailored technical and behavioral questions aligned with specific job descriptions, experience levels, and technology stacks."
              },
              {
                category: "Answer Evaluation",
                title: "Instant Structured Feedback",
                description: "Receives numerical rating scores (1-10), constructive feedback points, and model candidate responses for immediate review."
              },
              {
                category: "Aptitude Testing",
                title: "Quantitative Skill Assessment",
                description: "Provides quantitative aptitude tests covering mathematical reasoning, logic, and analytical problem-solving skills."
              },
              {
                category: "Performance Tracking",
                title: "Session Analytics & History",
                description: "Logs historical test scores, interview attempts, and streak metrics on a single centralized performance dashboard."
              },
              {
                category: "Question Library",
                title: "Domain Question Banks",
                description: "Offers structured common interview questions categorized by domain for self-study and rapid preparation."
              },
              {
                category: "AI Guidance",
                title: "Interactive Career Assistant",
                description: "Includes an AI chatbot interface for instant advice on interview preparation strategies, resume building, and role readiness."
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-left shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {feature.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Module Available</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200 dark:border-slate-800">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Structured 4-Step Preparation Process
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              A systematic workflow designed to build confidence and refine technical responses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              {
                step: "01",
                title: "Define Target Role",
                desc: "Select your desired job title, tech stack, and experience level to generate a customized interview scenario."
              },
              {
                step: "02",
                title: "Answer Questions",
                desc: "Respond to structured technical and behavioral questions in a timed interview simulation."
              },
              {
                step: "03",
                title: "Review Evaluation",
                desc: "Examine detailed numerical ratings, improvement suggestions, and ideal sample candidate answers."
              },
              {
                step: "04",
                title: "Track Progression",
                desc: "Monitor your ongoing performance score and revisit past mock sessions on your central dashboard."
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-left shadow-sm space-y-3"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-800 pb-2">
                  Step {item.step}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE US / READINESS SECTION */}
        <section id="why-us" className="py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200 dark:border-slate-800">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Placement Readiness
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Designed for Campus Placements & Job Interviews
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Built with essential capabilities to help candidates prepare thoroughly for competitive selection processes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {[
              {
                title: "Standardized Evaluation Rubric",
                desc: "Assess answers using objective scoring criteria across technical accuracy, problem-solving structure, and communication clarity."
              },
              {
                title: "Full Placement Coverage",
                desc: "Covers all key stages of campus and software engineering placement drives, including quantitative aptitude, coding theory, and HR rounds."
              },
              {
                title: "On-Demand Practice Sessions",
                desc: "Practice anytime without scheduling constraints, allowing consistent daily preparation before upcoming interview dates."
              },
              {
                title: "Centralized Performance History",
                desc: "Keep complete logs of every interview attempt and test score to identify weak areas and track performance over time."
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-left shadow-sm space-y-2"
              >
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white shadow-md space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ready to Prepare for Your Next Interview?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Access role-based mock interviews, quantitative aptitude assessments, and detailed performance metrics now.
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <button className="bg-[linear-gradient(90deg,#05080B_0%,#365F87_100%)] hover:opacity-95 border border-slate-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* CONTACT FORM SECTION */}
        <section id="contact" className="py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200 dark:border-slate-800">
          <Contect />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-8 border-t border-gray-200 dark:border-slate-800 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-200">
              © 2026 InterviewAI. All rights reserved.
            </p>
            <p className="font-semibold text-slate-900 dark:text-slate-200">
              Crafted with Passion by SRUSHTI KISAN SHIVANWAR
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
              Placement & Interview Preparation System
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium text-xs sm:text-sm">
            <a href="#overview" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Overview
            </a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </a>
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}