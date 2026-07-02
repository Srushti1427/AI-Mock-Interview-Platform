import { Lightbulb, Volume2, Loader2 } from "lucide-react";
import React from "react";
import { textToSpeech } from "@/utils/textToSpeech";

const QuestionSection = ({ mockInterviewQuestion, activeQuestionIndex }) => {
  React.useEffect(() => {
    console.log("Debug - QuestionSection Data:", {
      mockInterviewQuestion,
      activeQuestionIndex,
      currentQuestion: mockInterviewQuestion?.[activeQuestionIndex],
      allQuestions: mockInterviewQuestion,
    });
  }, [mockInterviewQuestion, activeQuestionIndex]);

  if (!mockInterviewQuestion || mockInterviewQuestion.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 min-h-[300px]">
        <Loader2 className="w-10 h-10 text-salmon animate-spin mb-4" />
        <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Preparing your interview...</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">AI is generating your first question</p>
      </div>
    );
  }

  const currentQuestion = mockInterviewQuestion[activeQuestionIndex];

  return (
    <div className="flex flex-col justify-between p-6 border rounded-lg bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-800 shadow-md">
      {/* Question Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {mockInterviewQuestion.map((question, index) => (
          <h2
            key={index}
            className={`p-2 rounded-full text-center text-xs md:text-sm cursor-pointer transition-all ${
              activeQuestionIndex === index
                ? "bg-gradient-to-r from-strawberry to-salmon text-white font-semibold shadow-md"
                : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            Question #{index + 1}
          </h2>
        ))}
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-strawberry dark:text-salmon mb-2">Interview Question</h3>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-relaxed">
          {currentQuestion?.Question
            ? `${currentQuestion.Question}${!currentQuestion.Question.endsWith("?") ? "?" : ""}`
            : "Question not loaded"}
        </h2>
      </div>

      {/* Speaker Icon */}
      {currentQuestion?.Question && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => textToSpeech(currentQuestion.Question)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-strawberry to-salmon text-white rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            <Volume2 size={20} />
            <span className="text-sm font-semibold">Hear Question</span>
          </button>
        </div>
      )}

      {/* Note Section */}
      <div className="border-l-4 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-slate-800/50">
        <h2 className="flex gap-2 items-center text-blue-800 dark:text-blue-300 font-semibold mb-2">
          <Lightbulb size={20} />
          Note:
        </h2>
        <p className="text-sm text-blue-900 dark:text-blue-200">
          Click start to answer button to review your answer and help the ai to generate the next question.
        </p>
      </div>
    </div>
  );
};

export default QuestionSection;
