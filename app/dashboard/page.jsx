import { UserButton } from "@clerk/nextjs";
import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { Sparkles, Brain, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-8 sm:mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-strawberry/20 via-black/20 to-salmon/20 blur-3xl"></div>
        <div className="relative px-2 sm:px-4 md:px-0">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-1 bg-gradient-to-r from-strawberry to-salmon p-2 rounded-full">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-sm sm:text-base font-semibold gradient-text">AI-Powered Interview Prep</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 font-poppins">
                Master Your
                <span className="gradient-text"> Interview Skills</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-100 max-w-2xl mb-6 sm:mb-8 font-light">
                Practice with AI-powered mock interviews, get real-time feedback, and nail your dream job.
              </p>
              
              {/* Stats Container */}
              <div className="glass-effect border border-peach/40 dark:border-strawberry-dark/60 rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10 backdrop-blur-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold gradient-text mb-1 sm:mb-2">AI-Powered</div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-200">Real Interview Questions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold gradient-text mb-1 sm:mb-2">Instant Feedback</div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-200">Improve Areas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold gradient-text mb-1 sm:mb-2">Track Progress</div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-200">View Analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {/* Create New Interview - Takes 1/3 */}
        <div className="lg:col-span-1">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 gradient-text" />
            Start Practicing
          </h2>
          <AddNewInterview/>
        </div>

        {/* Interview List - Takes 2/3 */}
        <div className="lg:col-span-2">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 gradient-text" />
            Your Interview History
          </h2>
          <InterviewList/>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
