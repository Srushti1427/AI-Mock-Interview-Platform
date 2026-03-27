import { UserButton } from "@clerk/nextjs";
import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { Sparkles, Brain, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-strawberry/20 via-black/20 to-salmon/20 blur-3xl"></div>
        <div className="relative">
          <div className="max-w-4xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-gradient-to-r from-strawberry to-salmon p-2 rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold gradient-text">AI-Powered Interview Prep</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-poppins">
              Master Your
              <span className="gradient-text"> Interview Skills</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-2 font-light">
              Practice with AI-powered mock interviews, get real-time feedback, and nail your dream job.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
              <div className="glass-effect rounded-xl p-4 text-center">
                <div className="text-2xl font-bold gradient-text">AI-Powered</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real Interview Questions</p>
              </div>
              <div className="glass-effect rounded-xl p-4 text-center">
                <div className="text-2xl font-bold gradient-text">Instant Feedback</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Improve Areas</p>
              </div>
              <div className="glass-effect rounded-xl p-4 text-center">
                <div className="text-2xl font-bold gradient-text">Track Progress</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">View Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Create New Interview - Takes 1/3 */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 gradient-text" />
            Start Practicing
          </h2>
          <AddNewInterview/>
        </div>

        {/* Interview List - Takes 2/3 */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 gradient-text" />
            Your Interview History
          </h2>
          <InterviewList/>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
