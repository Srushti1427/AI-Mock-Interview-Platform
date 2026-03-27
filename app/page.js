import React from 'react'
import { Button } from '@/components/ui/button';
import Head from 'next/head';
import Contect from './_components/Contect';
import Link from 'next/link';
import { FaGithub } from "react-icons/fa";
import { Zap, Brain, BarChart3, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const page = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Head>
        <title>AI Mock Interview - Master Your Interview Skills</title>
        <meta name="description" content="Ace your next interview with AI-powered mock interviews" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        {/* Header Section */}
        <header className="sticky top-0 z-50 glass-effect border-b-2 border-peach/40 dark:border-strawberry-dark/60 shadow-2xl backdrop-blur-3xl">
          <div className="container mx-auto flex justify-between items-center px-6 py-5 max-w-7xl">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer hover:scale-105 smooth-transition">
              <div className="relative w-11 h-11 bg-gradient-to-br from-strawberry to-salmon rounded-xl flex items-center justify-center shadow-lg shadow-salmon/40/40 group-hover:shadow-salmon/40/60 transform group-hover:scale-110 smooth-transition">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-strawberry to-salmon bg-clip-text text-transparent">InterviewAI</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">Master Your Skills</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {[
                { label: "Features", href: "#features" },
                { label: "Testimonials", href: "#testimonials" },
                { label: "Contact", href: "#contact" }
              ].map((item) => (
                <a 
                  key={item.href}
                  href={item.href} 
                  className="text-gray-700 dark:text-gray-300 hover:text-strawberry dark:hover:text-salmon font-bold smooth-transition relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-strawberry to-salmon group-hover:w-full smooth-transition rounded-full"></span>
                </a>
              ))}
            </nav>

            {/* CTA Button */}
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-full px-6 md:px-8 py-2.5 md:py-3 font-bold text-sm md:text-base flex items-center gap-2 shadow-lg shadow-salmon/40/30 hover:shadow-salmon/40/50 smooth-transition transform hover:scale-105">
                Dashboard
                <ArrowRight className="w-4 h-4 hidden sm:block" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-32 md:py-40 px-6 md:px-0">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            {/* Main gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
            
            {/* Animated blobs */}
            <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-900/30 rounded-full filter blur-3xl animate-pulse opacity-70"></div>
            <div className="absolute top-40 -right-40 w-96 h-96 bg-orange-500/25 rounded-full filter blur-3xl animate-pulse opacity-70 animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-blue-900/20 rounded-full filter blur-3xl animate-pulse opacity-50 animation-delay-4000"></div>
            
            {/* Gradient mesh overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-strawberry/5 via-transparent to-salmon/5"></div>
          </div>
          
          <div className="relative container mx-auto text-center max-w-5xl">
            {/* Badge */}
            <div className="inline-flex mb-8 px-4 py-2 bg-gradient-to-r from-salmon/30 to-strawberry/30 rounded-full border border-salmon/40 backdrop-blur-xl hover:border-salmon/60 smooth-transition cursor-pointer group">
              <span className="text-xs font-bold bg-gradient-to-r from-strawberry via-black to-salmon bg-clip-text text-transparent flex items-center gap-2 justify-center">
                <Sparkles className="w-4 h-4 text-salmon group-hover:animate-spin" /> 
                UNLOCK YOUR POTENTIAL WITH AI
              </span>
            </div>
            
            {/* Main Headline - Enhanced */}
            <h2 className="text-6xl md:text-8xl lg:text-8xl font-black leading-tight mb-8 tracking-tight">
              <span className="block">
                <span className="text-black dark:text-white">Master Your</span>
              </span>
              <span className="block mb-2">
                <span className="bg-gradient-to-r from-strawberry via-salmon to-strawberry bg-clip-text text-transparent animate-pulse">
                  Interview Skills
                </span>
              </span>
            </h2>
            
            {/* Subheadline */}
            <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
              Practice with <span className="font-semibold bg-gradient-to-r from-strawberry to-salmon bg-clip-text text-transparent">AI-powered mock interviews</span>, get <span className="font-semibold text-salmon">real-time feedback</span>, and <span className="font-semibold text-strawberry dark:text-blue-400">land your dream job</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <Link href="/dashboard" className="group">
                <Button className="relative overflow-hidden bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-full px-8 md:px-10 py-6 md:py-7 text-base md:text-lg font-bold flex items-center gap-3 smooth-transition shadow-2xl shadow-salmon/40/40 hover:shadow-3xl hover:shadow-salmon/40/60 transform hover:scale-105">
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 smooth-transition relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-salmon to-strawberry opacity-0 group-hover:opacity-20 smooth-transition"></div>
                </Button>
              </Link>
              <a href="#features">
                <Button className="rounded-full px-8 md:px-10 py-6 md:py-7 text-base md:text-lg font-bold border-2 border-blue-900 dark:border-salmon hover:bg-blue-900 hover:text-white dark:hover:bg-orange-500 dark:hover:text-black smooth-transition transform hover:scale-105 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Stats Cards - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {[
                { stat: "10K+", label: "Successful Interviews", icon: "🚀" },
                { stat: "98%", label: "Success Rate", icon: "⭐" },
                { stat: "24/7", label: "AI Availability", icon: "⚡" }
              ].map((item, idx) => (
                <div key={idx} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-strawberry to-salmon rounded-2xl opacity-0 group-hover:opacity-30 smooth-transition blur-xl group-hover:blur-2xl"></div>
                  <div className="relative glass-effect border-2 border-orange-300/50 dark:border-strawberry-dark/70 rounded-2xl p-8 md:p-10 backdrop-blur-2xl hover:border-salmon/80 smooth-transition group-hover:shadow-2xl group-hover:shadow-salmon/40/30 transform group-hover:scale-105 group-hover:-translate-y-1">
                    <div className="text-5xl mb-3">{item.icon}</div>
                    <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-strawberry to-salmon bg-clip-text text-transparent">
                      {item.stat}
                    </div>
                    <p className="text-gray-700 dark:text-gray-400 mt-3 font-medium text-sm md:text-base">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-40 px-6 md:px-0 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent"></div>
          
          <div className="relative container mx-auto max-w-6xl">
            {/* Heading */}
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                <span className="block text-black dark:text-white">Powerful</span>
                <span className="block bg-gradient-to-r from-strawberry via-salmon to-strawberry bg-clip-text text-transparent">Features</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">Everything you need to master your interview preparation</p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI Mock Interviews",
                  description: "Experience realistic interview scenarios with our advanced Gemini AI that adapts to your answers.",
                  gradient: "from-strawberry to-blue-700",
                  iconBg: "from-strawberry to-blue-800"
                },
                {
                  icon: Zap,
                  title: "Instant AI Feedback",
                  description: "Get comprehensive, personalized feedback immediately after each interview session.",
                  gradient: "from-salmon to-orange-600",
                  iconBg: "from-salmon to-orange-600"
                },
                {
                  icon: BarChart3,
                  title: "Detailed Analytics",
                  description: "Track your progress with comprehensive reports showing strengths and improvement areas.",
                  gradient: "from-black to-slate-700",
                  iconBg: "from-black to-slate-800"
                }
              ].map((feature, idx) => (
                <div key={idx} className="group relative h-full">
                  {/* Gradient background on hover */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-40 smooth-transition blur-2xl group-hover:blur-3xl`}></div>
                  
                  {/* Card */}
                  <div className="relative h-full glass-effect border-2 border-peach/40 dark:border-strawberry-dark/60 rounded-3xl p-10 backdrop-blur-2xl hover:border-salmon/80 smooth-transition group-hover:shadow-3xl group-hover:shadow-salmon/40/30 transform group-hover:scale-105 group-hover:-translate-y-2 flex flex-col">
                    {/* Icon */}
                    <div className={`inline-flex p-4 bg-gradient-to-br ${feature.iconBg} rounded-2xl mb-6 w-fit group-hover:scale-110 smooth-transition`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                    
                    {/* Description */}
                    <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow leading-relaxed">{feature.description}</p>
                    
                    {/* Link */}
                    <div className="flex items-center gap-2 text-salmon font-bold group-hover:translate-x-2 smooth-transition cursor-pointer">
                      <span>Learn More</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 md:py-40 px-6 md:px-0 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-strawberry/10 via-black/5 to-salmon/10"></div>
          
          <div className="relative container mx-auto max-w-6xl">
            {/* Heading */}
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                <span className="block text-black dark:text-white">Why Choose</span>
                <span className="block bg-gradient-to-r from-strawberry via-salmon to-strawberry bg-clip-text text-transparent">InterviewAI?</span>
              </h2>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Advanced AI Technology", desc: "Powered by Gemini 2.5-flash for intelligent question generation and feedback", icon: "🤖" },
                { title: "Personalized Experience", desc: "Tailored interviews based on your role, experience level, and technical stack", icon: "🎯" },
                { title: "Real-time Feedback", desc: "Get instant insights on your performance immediately after each interview", icon: "⚡" },
                { title: "Progress Tracking", desc: "Monitor your improvement with detailed analytics and historical records", icon: "📊" }
              ].map((item, idx) => (
                <div key={idx} className="group relative">
                  {/* Gradient border */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-strawberry/40 to-salmon/40 rounded-2xl opacity-0 group-hover:opacity-100 smooth-transition blur-lg"></div>
                  
                  {/* Card */}
                  <div className="relative glass-effect border-2 border-peach/40 dark:border-strawberry-dark/60 rounded-2xl p-8 backdrop-blur-xl hover:border-salmon/80 smooth-transition group-hover:shadow-2xl group-hover:shadow-salmon/40/30 flex gap-5 transform group-hover:scale-105 group-hover:-translate-y-1">
                    <div className="text-5xl flex-shrink-0">{item.icon}</div>
                    <div className="flex-grow">
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 md:py-40 px-6 md:px-0 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-strawberry/5 via-transparent to-salmon/5"></div>
          
          <div className="relative container mx-auto max-w-6xl">
            {/* Heading */}
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                <span className="block text-black dark:text-white">Success</span>
                <span className="block bg-gradient-to-r from-strawberry via-salmon to-strawberry bg-clip-text text-transparent">Stories</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">Join thousands of successful candidates</p>
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote: "The AI mock interviews were incredibly realistic. I felt fully prepared before my actual interview and landed the job!",
                  author: "Alex Johnson",
                  role: "Software Engineer at Google",
                  rating: 5,
                  icon: "🚀"
                },
                {
                  quote: "The feedback was spot-on and helped me refine my answers. Highly recommend this to anyone preparing for interviews.",
                  author: "Sarah Williams",
                  role: "Product Manager at Meta",
                  rating: 5,
                  icon: "⭐"
                },
                {
                  quote: "Amazing platform! The detailed reports showed exactly where I needed improvement. Great value for money.",
                  author: "Michael Chen",
                  role: "Data Scientist at Apple",
                  rating: 5,
                  icon: "💡"
                },
                {
                  quote: "Best interview prep tool I've used. The AI feedback is constructive and helps you get better with each attempt.",
                  author: "Emma Davis",
                  role: "UX Designer at Microsoft",
                  rating: 5,
                  icon: "✨"
                }
              ].map((testimonial, idx) => (
                <div key={idx} className="group relative">
                  {/* Gradient glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-salmon/30 to-strawberry/30 rounded-3xl opacity-0 group-hover:opacity-100 smooth-transition blur-xl"></div>
                  
                  {/* Card */}
                  <div className="relative glass-effect border-2 border-peach/40 dark:border-strawberry-dark/60 rounded-3xl p-10 backdrop-blur-2xl hover:border-salmon/80 smooth-transition group-hover:shadow-3xl group-hover:shadow-salmon/40/30 transform group-hover:scale-105 group-hover:-translate-y-1">
                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-2xl text-salmon">★</span>
                      ))}
                    </div>
                    
                    {/* Icon */}
                    <div className="text-5xl mb-4">{testimonial.icon}</div>
                    
                    {/* Quote */}
                    <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                    
                    {/* Author */}
                    <div className="border-t border-peach/50 dark:border-strawberry-dark/50 pt-6">
                      <h4 className="font-black text-gray-900 dark:text-white text-lg">{testimonial.author}</h4>
                      <p className="text-sm text-salmon font-bold mt-2">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-40 px-6 md:px-0 relative">
          {/* Background animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
          </div>
          
          <div className="relative container mx-auto max-w-4xl">
            <div className="relative group">
              {/* Outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-strawberry via-salmon to-strawberry rounded-3xl opacity-20 group-hover:opacity-40 smooth-transition blur-3xl group-hover:blur-2xl"></div>
              
              {/* Card */}
              <div className="relative glass-effect border-2 border-orange-300/60 dark:border-strawberry-dark/80 rounded-3xl p-12 md:p-16 backdrop-blur-2xl hover:border-salmon smooth-transition text-center transform group-hover:scale-105 group-hover:-translate-y-2">
                <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                  <span className="block text-black dark:text-white">Ready to Ace Your</span>
                  <span className="block bg-gradient-to-r from-strawberry via-salmon to-strawberry bg-clip-text text-transparent">Interview?</span>
                </h2>
                
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Start practicing with AI-powered mock interviews today and boost your confidence to land your dream job
                </p>
                
                <Link href="/dashboard">
                  <Button className="relative overflow-hidden bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-full px-10 md:px-14 py-7 md:py-8 text-lg md:text-xl font-black flex items-center gap-3 smooth-transition shadow-2xl shadow-salmon/40/50 hover:shadow-3xl hover:shadow-salmon/40/70 transform hover:scale-110 mx-auto">
                    <span className="relative z-10">Start Free Trial</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 smooth-transition relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-salmon to-strawberry opacity-0 group-hover:opacity-30 smooth-transition"></div>
                  </Button>
                </Link>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">No credit card required • Start practicing immediately</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 md:py-40 px-6 md:px-0 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-salmon/5 via-transparent to-strawberry/5"></div>
          
          <div className="relative">
            <Contect />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-black via-slate-900 to-strawberry text-white py-16 md:py-20 border-t-2 border-salmon/30">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/30 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-strawberry to-salmon rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-salmon to-blue-400 bg-clip-text text-transparent">InterviewAI</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Master your interview skills with AI-powered mock interviews and personalized feedback.</p>
            </div>

            {/* Features Links */}
            <div className="md:col-span-1">
              <h4 className="font-bold text-lg mb-6 text-white">Features</h4>
              <ul className="space-y-3">
                {["AI Interviews", "Instant Feedback", "Analytics"].map((item) => (
                  <li key={item}>
                    <a href="#features" className="text-gray-400 hover:text-salmon smooth-transition font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="md:col-span-1">
              <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                {["About Us", "Testimonials", "Blog"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-salmon smooth-transition font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-1">
              <h4 className="font-bold text-lg mb-6 text-white">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-salmon smooth-transition font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-salmon/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-sm">© 2024 InterviewAI. All rights reserved. Crafted with passion for your success.</p>
            <p className="text-gray-500 text-xs">Powered by Gemini AI | Built with Next.js & Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default page