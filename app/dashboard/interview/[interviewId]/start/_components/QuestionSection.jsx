import { Lightbulb, Volume2 } from "lucide-react";
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
      <div className="p-5 border rounded-lg bg-white border-gray-200">
        <p className="text-gray-600">Loading interview questions...</p>
      </div>
    );
  }

  const currentQuestion = mockInterviewQuestion[activeQuestionIndex];

  return (
    <div className="flex flex-col justify-between p-6 border rounded-lg bg-white border-gray-300 shadow-md">
      {/* Question Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {mockInterviewQuestion.map((question, index) => (
          <h2
            key={index}
            className={`p-2 rounded-full text-center text-xs md:text-sm cursor-pointer transition-all ${
              activeQuestionIndex === index
                ? "bg-gradient-to-r from-strawberry to-salmon text-white font-semibold shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Question #{index + 1}
          </h2>
        ))}
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-strawberry mb-2">Interview Question</h3>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed">
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
      <div className="border-l-4 border-salmon rounded-lg p-4 bg-blue-50">
        <h2 className="flex gap-2 items-center text-strawberry font-semibold mb-2">
          <Lightbulb size={20} />
          Note:
        </h2>
        <p className="text-sm text-strawberry">
          {process.env.NEXT_PUBLIC_QUESTION_NOTE ||
            "Take your time to think about the answer carefully. This is a mock interview, so feel free to take a few seconds before responding."}
        </p>
      </div>
    </div>
  );
};

export default QuestionSection;
