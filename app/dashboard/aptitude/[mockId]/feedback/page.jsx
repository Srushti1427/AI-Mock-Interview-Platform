"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";

const GRADIENT_BTN_STYLE = {
  background: "linear-gradient(90deg, #05080B 0%, #365F87 100%)",
};

const SECONDARY_BTN_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#D9E0E7",
  color: "#0B1F33",
};

function AptitudeFeedback({ params }) {
  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all");

  const [diffExplanations, setDiffExplanations] = useState({});
  const [loadingExplains, setLoadingExplains] = useState({});
  const [launchingWeakTest, setLaunchingWeakTest] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    GetFeedbackDetails();
  }, []);

  const GetFeedbackDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/aptitude/${params.mockId}`);
      if (!res.ok) {
        console.error("Failed to fetch test feedback", await res.text());
        setLoading(false);
        return;
      }

      const result = await res.json();
      if (result) {
        setTestData(result);

        let questionsToUse = [];
        const savedQuestions = localStorage.getItem(`aptitude_questions_${params.mockId}`);
        if (savedQuestions) {
          try {
            questionsToUse = JSON.parse(savedQuestions);
          } catch (e) {
            console.error("Parse error", e);
          }
        }
        if (questionsToUse.length === 0 && result.questions && result.questions.length > 0) {
          questionsToUse = result.questions;
        } else if (questionsToUse.length === 0 && result.jsonMockResp) {
          try {
            questionsToUse = JSON.parse(result.jsonMockResp);
          } catch (e) {
            console.error("Parse error jsonMockResp", e);
          }
        }

        setQuestions(questionsToUse);

        const savedAnswers = localStorage.getItem(`aptitude_answers_${params.mockId}`);
        if (savedAnswers) {
          try {
            setUserAnswers(JSON.parse(savedAnswers));
          } catch (e) {
            console.error(e);
          }
        } else if (result.userAnswers) {
          setUserAnswers(result.userAnswers);
        }
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainDifferently = async (qIndex, questionObj) => {
    try {
      setLoadingExplains((prev) => ({ ...prev, [qIndex]: true }));
      const res = await fetch("/api/aptitude/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionObj.Question,
          options: questionObj.Options,
          correctAnswer: questionObj.CorrectAnswer,
          currentExplanation: questionObj.Explanation,
          style: "analogy",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate alternative explanation");
      const { explanation } = await res.json();
      setDiffExplanations((prev) => ({ ...prev, [qIndex]: explanation }));
    } catch (err) {
      console.error(err);
      toast.error("Could not generate alternative explanation");
    } finally {
      setLoadingExplains((prev) => ({ ...prev, [qIndex]: false }));
    }
  };

  const handlePracticeWeakAreas = async () => {
    try {
      setLaunchingWeakTest(true);
      const weakCategory = testData?.category || "Quantitative Aptitude";

      const res = await fetch("/api/generateAptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `Practice Weak Areas: ${weakCategory}`,
          category: weakCategory,
          difficulty: "Adaptive",
          questionCount: 10,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate targeted weak area test");
      const { questions: weakQs, rawText } = await res.json();

      const mockId = uuidv4();
      const createRes = await fetch("/api/aptitude/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mockId,
          topic: `Targeted Practice: ${weakCategory}`,
          category: weakCategory,
          difficulty: "Adaptive",
          mode: "practice",
          questionCount: weakQs.length,
          timeLimit: 15,
          negativeMarking: false,
          questions: weakQs,
          jsonMockResp: rawText,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!createRes.ok) throw new Error("Failed to save weak area test");
      router.push(`/dashboard/aptitude/${mockId}/start`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to launch targeted weak area test");
    } finally {
      setLaunchingWeakTest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <LoaderCircle className="w-8 h-8 animate-spin text-[#0B1F33] dark:text-white mb-3" />
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Calculating results...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center text-slate-500">
        <p>No test results available.</p>
        <Link href="/dashboard/aptitude">
          <button style={GRADIENT_BTN_STYLE} className="mt-4 px-5 py-2 text-white font-semibold text-xs rounded-[14px]">
            Return to Aptitude Page
          </button>
        </Link>
      </div>
    );
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const categoryBreakdown = {};
  const difficultyBreakdown = {};

  questions.forEach((q, idx) => {
    const userAns = (userAnswers[idx] || "").toString().trim().toLowerCase();
    const correctAns = (q.CorrectAnswer || "").toString().trim().toLowerCase();

    const cat = q.Category || testData?.category || "General Aptitude";
    const diff = q.Difficulty || testData?.difficulty || "Medium";

    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { total: 0, correct: 0 };
    if (!difficultyBreakdown[diff]) difficultyBreakdown[diff] = { total: 0, correct: 0 };

    categoryBreakdown[cat].total += 1;
    difficultyBreakdown[diff].total += 1;

    if (!userAns) {
      skippedCount += 1;
    } else if (userAns === correctAns) {
      correctCount += 1;
      categoryBreakdown[cat].correct += 1;
      difficultyBreakdown[diff].correct += 1;
    } else {
      incorrectCount += 1;
    }
  });

  const totalQs = questions.length;
  const rawScore = correctCount;
  const isNegativeMarking = Boolean(testData?.negativeMarking);
  const negativeDeductions = isNegativeMarking ? Number((incorrectCount * 0.25).toFixed(2)) : 0;
  const netScore = Math.max(0, Number((rawScore - negativeDeductions).toFixed(2)));
  const percentage = totalQs > 0 ? Math.round((rawScore / totalQs) * 100) : 0;

  const timeSecs = Number(testData?.timeTaken) || 0;
  const timeMins = Math.floor(timeSecs / 60);
  const timeRemSecs = timeSecs % 60;
  const timeFormatted = `${timeMins}m ${timeRemSecs}s`;

  const filteredQuestions = questions.map((q, originalIdx) => ({ q, originalIdx })).filter(({ q, originalIdx }) => {
    const userAns = (userAnswers[originalIdx] || "").toString().trim().toLowerCase();
    const correctAns = (q.CorrectAnswer || "").toString().trim().toLowerCase();
    const isCorrect = userAns.length > 0 && userAns === correctAns;
    const isSkipped = !userAns;

    if (filterTab === "correct") return isCorrect;
    if (filterTab === "incorrect") return !isCorrect && !isSkipped;
    if (filterTab === "skipped") return isSkipped;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[#0B1F33]">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E0E7] dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-[#5A6E85] uppercase tracking-wider">Test Report</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F33] dark:text-white mt-1">
            Performance Summary
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Category: {testData?.category || testData?.topic} • Difficulty: {testData?.difficulty || "Medium"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePracticeWeakAreas}
            disabled={launchingWeakTest}
            style={SECONDARY_BTN_STYLE}
            className="border font-semibold text-xs px-4 py-2 rounded-[14px] hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {launchingWeakTest ? "Loading..." : "Practice Weak Area"}
          </button>

          <Link href={`/dashboard/aptitude/${params.mockId}/start`}>
            <button
              style={GRADIENT_BTN_STYLE}
              className="text-white font-semibold text-xs px-5 py-2.5 rounded-[14px] shadow-none hover:opacity-95 transition-opacity cursor-pointer"
            >
              Retake Test
            </button>
          </Link>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Score Box */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-6 shadow-none flex flex-col justify-between space-y-4">
          <div className="text-xs font-semibold text-[#5A6E85] uppercase tracking-wider">
            Accuracy
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold text-[#0B1F33] dark:text-white">{percentage}%</span>
            <span className="text-xs font-medium text-[#5A6E85]">
              ({rawScore} / {totalQs} Correct)
            </span>
          </div>

          {isNegativeMarking && (
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Negative Marking (-0.25): Net Score = {netScore} / {totalQs}
            </div>
          )}

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0B1F33] dark:bg-slate-100 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Answers Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-5 shadow-none flex flex-col justify-between space-y-2 text-xs">
          <div className="font-semibold text-[#5A6E85] uppercase tracking-wider">Breakdown</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#0B1F33] dark:text-white font-medium">
              <span>Correct:</span>
              <span>{correctCount}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Incorrect:</span>
              <span>{incorrectCount}</span>
            </div>
            <div className="flex justify-between text-[#5A6E85]">
              <span>Skipped:</span>
              <span>{skippedCount}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-[#D9E0E7] dark:border-slate-800">
            Total Questions: {totalQs}
          </div>
        </div>

        {/* Time Taken */}
        <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-5 shadow-none flex flex-col justify-between space-y-2 text-xs">
          <div className="font-semibold text-[#5A6E85] uppercase tracking-wider">Time Taken</div>
          <div className="text-2xl font-bold text-[#0B1F33] dark:text-white">{timeFormatted}</div>
          <div className="text-[11px] text-slate-400">
            Avg {totalQs > 0 ? (timeSecs / totalQs).toFixed(1) : 0}s per question
          </div>
        </div>
      </div>

      {/* Category & Difficulty Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-5 shadow-none space-y-3">
          <div className="text-xs font-semibold text-[#0B1F33] dark:text-white uppercase tracking-wider">
            Category Performance
          </div>
          <div className="space-y-3 pt-1">
            {Object.entries(categoryBreakdown).map(([catName, stat]) => {
              const catPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <div key={catName} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-[#0B1F33] dark:text-white">
                    <span>{catName}</span>
                    <span>
                      {catPct}% ({stat.correct}/{stat.total})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B1F33] dark:bg-slate-100"
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-5 shadow-none space-y-3">
          <div className="text-xs font-semibold text-[#0B1F33] dark:text-white uppercase tracking-wider">
            Difficulty Performance
          </div>
          <div className="space-y-3 pt-1">
            {Object.entries(difficultyBreakdown).map(([diffName, stat]) => {
              const diffPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <div key={diffName} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-[#0B1F33] dark:text-white">
                    <span>{diffName} Difficulty</span>
                    <span>
                      {diffPct}% ({stat.correct}/{stat.total})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B1F33] dark:bg-slate-100"
                      style={{ width: `${diffPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="space-y-4 pt-4 border-t border-[#D9E0E7] dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#5A6E85] uppercase tracking-wider">
              Question Review
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Review individual responses and step-by-step logic.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-[14px] text-xs">
            {[
              { id: "all", label: `All (${totalQs})` },
              { id: "correct", label: `Correct (${correctCount})` },
              { id: "incorrect", label: `Incorrect (${incorrectCount})` },
              { id: "skipped", label: `Skipped (${skippedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 rounded-[10px] font-medium transition-colors cursor-pointer ${
                  filterTab === tab.id
                    ? "bg-white dark:bg-slate-900 text-[#0B1F33] dark:text-white shadow-none font-semibold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Review Cards */}
        <div className="space-y-4">
          {filteredQuestions.map(({ q, originalIdx }) => {
            const userAns = (userAnswers[originalIdx] || "").toString().trim();
            const correctAns = (q.CorrectAnswer || "").toString().trim();
            const isCorrect = userAns.length > 0 && userAns.toLowerCase() === correctAns.toLowerCase();
            const isSkipped = !userAns;

            return (
              <div
                key={originalIdx}
                className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-6 shadow-none space-y-4"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0B1F33] dark:text-white">Q{originalIdx + 1}.</span>
                    <span className="text-[#5A6E85] font-medium">
                      {q.Category || testData?.category || "General"} • {q.Difficulty || testData?.difficulty || "Medium"}
                    </span>
                  </div>

                  {isSkipped ? (
                    <span className="font-medium text-[#5A6E85]">Skipped</span>
                  ) : isCorrect ? (
                    <span className="font-semibold text-[#0B1F33] dark:text-white">Correct</span>
                  ) : (
                    <span className="font-medium text-[#5A6E85]">Incorrect</span>
                  )}
                </div>

                <h3 className="font-semibold text-base text-[#0B1F33] dark:text-white leading-relaxed">
                  {q.Question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.Options?.map((opt, oIdx) => {
                    const isUserChoice = userAns.toLowerCase() === opt.trim().toLowerCase();
                    const isCorrectChoice = correctAns.toLowerCase() === opt.trim().toLowerCase();

                    let optionStyle = "border-[#D9E0E7] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300";
                    if (isCorrectChoice) {
                      optionStyle = "border-[#0B1F33] dark:border-slate-100 bg-slate-50 dark:bg-slate-800 text-[#0B1F33] dark:text-white font-semibold";
                    } else if (isUserChoice && !isCorrectChoice) {
                      optionStyle = "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500";
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 border rounded-[14px] flex items-center justify-between ${optionStyle}`}
                      >
                        <span>
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </span>
                        {isUserChoice && (
                          <span className="text-[10px] font-medium text-[#5A6E85] uppercase">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-700 rounded-[14px] text-xs space-y-1.5">
                  <div className="font-semibold text-[#0B1F33] dark:text-white">
                    Correct Answer: <span className="font-bold">{q.CorrectAnswer}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{q.Explanation}</p>
                  {q.ShortcutTip && (
                    <div className="pt-1.5 border-t border-[#D9E0E7] dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-[#0B1F33] dark:text-white">Shortcut: </span>
                      <span>{q.ShortcutTip}</span>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => handleExplainDifferently(originalIdx, q)}
                    disabled={loadingExplains[originalIdx]}
                    style={SECONDARY_BTN_STYLE}
                    className="border font-semibold text-xs px-4 py-2 rounded-[14px] hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loadingExplains[originalIdx] ? "Generating..." : "Explain Differently"}
                  </button>

                  {diffExplanations[originalIdx] && (
                    <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-700 rounded-[14px] text-xs">
                      <div className="font-semibold text-[#0B1F33] dark:text-white mb-1">
                        Alternative Intuitive Explanation:
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {diffExplanations[originalIdx]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 text-center">
        <Link href="/dashboard/aptitude">
          <button
            style={SECONDARY_BTN_STYLE}
            className="border font-semibold text-xs px-6 py-2.5 rounded-[14px] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Return to Aptitude Page
          </button>
        </Link>
      </div>
    </div>
  );
}

export default AptitudeFeedback;
