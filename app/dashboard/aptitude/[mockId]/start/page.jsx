"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const GRADIENT_BTN_STYLE = {
  background: "linear-gradient(90deg, #05080B 0%, #365F87 100%)",
};

const SECONDARY_BTN_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#D9E0E7",
  color: "#0B1F33",
};

function StartAptitudeTest({ params }) {
  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [practiceRevealed, setPracticeRevealed] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const timerRef = useRef(null);

  // Practice Mode AI States
  const [hintsRevealed, setHintsRevealed] = useState({});
  const [diffExplanations, setDiffExplanations] = useState({});
  const [loadingDiffExplain, setLoadingDiffExplain] = useState(false);

  // Adaptive difficulty tracking
  const [adaptiveLevel, setAdaptiveLevel] = useState("Medium");
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);

  const router = useRouter();

  useEffect(() => {
    GetTestDetails();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const GetTestDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/aptitude/${params.mockId}`);
      if (!res.ok) {
        toast.error("Failed to fetch test details");
        setLoading(false);
        return;
      }
      const result = await res.json();
      if (result) {
        setTestData(result);
        
        let loadedQuestions = [];
        if (result.questions && Array.isArray(result.questions) && result.questions.length > 0) {
          loadedQuestions = result.questions;
        } else if (result.jsonMockResp) {
          try {
            loadedQuestions = JSON.parse(result.jsonMockResp);
          } catch (e) {
            console.error("Failed to parse jsonMockResp", e);
          }
        }

        if (loadedQuestions.length === 0) {
          await generateFreshQuestions(result.topic, result.difficulty, result.questionCount || 10);
        } else {
          setQuestions(loadedQuestions);
          initTimer(result.timeLimit || 15);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error fetching aptitude test:", err);
      toast.error("An error occurred loading the test");
      setLoading(false);
    }
  };

  const generateFreshQuestions = async (topic, difficulty, questionCount) => {
    try {
      const res = await fetch("/api/generateAptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, questionCount }),
      });

      if (!res.ok) throw new Error("Question generation failed");
      const { questions: genQs } = await res.json();
      setQuestions(genQs || []);
      initTimer(testData?.timeLimit || 15);
    } catch (err) {
      console.error("Error generating fresh questions:", err);
      toast.error("Failed to load test questions");
    } finally {
      setLoading(false);
    }
  };

  const initTimer = (limitMinutes) => {
    const totalSecs = (Number(limitMinutes) || 15) * 60;
    setSecondsRemaining(totalSecs);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prevSecs) => {
        if (prevSecs <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prevSecs - 1;
      });
      setTimeTakenSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleAutoSubmit = () => {
    toast.warning("Time limit expired! Submitting your test automatically.");
    executeSubmission(true);
  };

  const handleOptionSelect = (option) => {
    if (submitting) return;
    const newAnswers = {
      ...selectedAnswers,
      [activeQuestionIndex]: option,
    };
    setSelectedAnswers(newAnswers);

    if (testData?.difficulty === "Adaptive") {
      const currentQ = questions[activeQuestionIndex];
      const isCorrect = currentQ && option.trim().toLowerCase() === currentQ.CorrectAnswer.trim().toLowerCase();
      
      if (isCorrect) {
        setConsecutiveCorrect((prev) => prev + 1);
        setConsecutiveIncorrect(0);
        if (consecutiveCorrect + 1 >= 2 && adaptiveLevel !== "Hard") {
          setAdaptiveLevel(adaptiveLevel === "Easy" ? "Medium" : "Hard");
          toast.info("Performance boosted! Difficulty level increased.");
          setConsecutiveCorrect(0);
        }
      } else {
        setConsecutiveIncorrect((prev) => prev + 1);
        setConsecutiveCorrect(0);
        if (consecutiveIncorrect + 1 >= 2 && adaptiveLevel !== "Easy") {
          setAdaptiveLevel(adaptiveLevel === "Hard" ? "Medium" : "Easy");
          toast.info("Difficulty level adjusted for practice.");
          setConsecutiveIncorrect(0);
        }
      }
    }
  };

  const handleClearAnswer = () => {
    const copy = { ...selectedAnswers };
    delete copy[activeQuestionIndex];
    setSelectedAnswers(copy);

    const revCopy = { ...practiceRevealed };
    delete revCopy[activeQuestionIndex];
    setPracticeRevealed(revCopy);
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [activeQuestionIndex]: !prev[activeQuestionIndex],
    }));
  };

  const handleRevealPracticeAnswer = () => {
    setPracticeRevealed((prev) => ({
      ...prev,
      [activeQuestionIndex]: true,
    }));
  };

  const handleFetchAlternativeExplanation = async () => {
    const q = questions[activeQuestionIndex];
    if (!q) return;

    try {
      setLoadingDiffExplain(true);
      const res = await fetch("/api/aptitude/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.Question,
          options: q.Options,
          correctAnswer: q.CorrectAnswer,
          currentExplanation: q.Explanation,
          style: "analogy",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate explanation");
      const { explanation } = await res.json();
      setDiffExplanations((prev) => ({
        ...prev,
        [activeQuestionIndex]: explanation,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Could not load alternative explanation");
    } finally {
      setLoadingDiffExplain(false);
    }
  };

  const executeSubmission = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      let scoreCount = 0;
      questions.forEach((q, idx) => {
        const userAns = (selectedAnswers[idx] || "").toString().trim().toLowerCase();
        const correctAns = (q.CorrectAnswer || "").toString().trim().toLowerCase();
        if (userAns && userAns === correctAns) {
          scoreCount += 1;
        }
      });

      const payload = {
        mockId: params.mockId,
        score: scoreCount,
        totalQuestions: questions.length,
        answers: selectedAnswers,
        questions,
        timeTaken: timeTakenSeconds,
        negativeMarking: Boolean(testData?.negativeMarking),
      };

      localStorage.setItem(`aptitude_answers_${params.mockId}`, JSON.stringify(selectedAnswers));
      localStorage.setItem(`aptitude_questions_${params.mockId}`, JSON.stringify(questions));

      await fetch("/api/aptitude/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      router.replace(`/dashboard/aptitude/${params.mockId}/feedback`);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Error submitting test results");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <LoaderCircle className="w-8 h-8 animate-spin text-[#0B1F33] dark:text-white mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Loading test environment...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">
        <p>Could not load questions for this test.</p>
        <button
          onClick={() => router.push("/dashboard/aptitude")}
          style={GRADIENT_BTN_STYLE}
          className="mt-4 px-5 py-2 text-white font-semibold text-xs rounded-[14px]"
        >
          Return to Aptitude Page
        </button>
      </div>
    );
  }

  const currentQuestion = questions[activeQuestionIndex];
  const isPracticeMode = testData?.mode === "practice";

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  const answeredCount = Object.keys(selectedAnswers).length;
  const reviewCount = Object.keys(markedForReview).filter((k) => markedForReview[k]).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-[#0B1F33]">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-5 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-[#0B1F33] dark:text-white">
              {testData?.category || testData?.topic || "Aptitude"}
            </span>
            <span>•</span>
            <span>{testData?.difficulty === "Adaptive" ? `Adaptive (${adaptiveLevel})` : testData?.difficulty || "Medium"}</span>
            <span>•</span>
            <span className="capitalize">{testData?.mode || "Test"} Mode</span>
          </div>
          <h1 className="text-xl font-bold text-[#0B1F33] dark:text-white">
            {testData?.topic}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-[10px] border border-[#D9E0E7] dark:border-slate-800 font-mono font-bold text-base text-[#0B1F33] dark:text-white bg-slate-50 dark:bg-slate-800">
            {timeFormatted}
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            style={GRADIENT_BTN_STYLE}
            className="text-white font-semibold text-xs px-5 py-2.5 rounded-[14px] shadow-none hover:opacity-95 transition-opacity cursor-pointer"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Main Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-6 shadow-none space-y-6">
            <div className="flex items-center justify-between border-b border-[#D9E0E7] dark:border-slate-800 pb-4 text-xs">
              <div className="font-semibold text-slate-500">
                Question <span className="text-[#0B1F33] dark:text-white font-bold">{activeQuestionIndex + 1}</span> of{" "}
                <span className="text-[#0B1F33] dark:text-white font-bold">{questions.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMarkForReview}
                  style={markedForReview[activeQuestionIndex] ? GRADIENT_BTN_STYLE : SECONDARY_BTN_STYLE}
                  className={`px-3 py-1.5 rounded-[14px] text-xs font-semibold border transition-colors cursor-pointer ${
                    markedForReview[activeQuestionIndex] ? "text-white" : ""
                  }`}
                >
                  {markedForReview[activeQuestionIndex] ? "Marked for Review" : "Mark for Review"}
                </button>

                {selectedAnswers[activeQuestionIndex] && (
                  <button
                    onClick={handleClearAnswer}
                    className="text-xs text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-[14px] font-medium cursor-pointer"
                  >
                    Clear Answer
                  </button>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-semibold text-[#0B1F33] dark:text-white leading-relaxed">
              {currentQuestion?.Question}
            </h2>

            {/* Options List */}
            <div className="space-y-2.5 pt-1">
              {currentQuestion?.Options?.map((option, index) => {
                const isSelected = selectedAnswers[activeQuestionIndex] === option;
                const isRevealed = isPracticeMode && practiceRevealed[activeQuestionIndex];
                const isCorrectOption =
                  option.trim().toLowerCase() === currentQuestion.CorrectAnswer.trim().toLowerCase();

                let optionStyle = "border-[#D9E0E7] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#0B1F33] dark:text-white hover:border-slate-400";

                if (isRevealed) {
                  if (isCorrectOption) {
                    optionStyle = "border-[#0B1F33] dark:border-slate-100 bg-slate-50 dark:bg-slate-800 text-[#0B1F33] dark:text-white font-semibold";
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500";
                  }
                } else if (isSelected) {
                  optionStyle = "border-[#0B1F33] dark:border-slate-100 bg-slate-50 dark:bg-slate-800 font-semibold text-[#0B1F33] dark:text-white";
                }

                return (
                  <div
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-3.5 border rounded-[14px] cursor-pointer transition-colors flex items-center justify-between text-xs ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded flex items-center justify-center font-semibold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#D9E0E7] dark:border-slate-700">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isRevealed && isCorrectOption && (
                      <span className="text-[11px] font-bold text-[#0B1F33] dark:text-white">Correct</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Practice Mode Tools */}
            {isPracticeMode && (
              <div className="pt-4 border-t border-[#D9E0E7] dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {!practiceRevealed[activeQuestionIndex] ? (
                    <button
                      onClick={handleRevealPracticeAnswer}
                      disabled={!selectedAnswers[activeQuestionIndex]}
                      style={SECONDARY_BTN_STYLE}
                      className="px-3.5 py-1.5 border rounded-[14px] text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                    >
                      Check Explanation
                    </button>
                  ) : (
                    <button
                      onClick={() => setPracticeRevealed({ ...practiceRevealed, [activeQuestionIndex]: false })}
                      style={SECONDARY_BTN_STYLE}
                      className="px-3.5 py-1.5 border rounded-[14px] text-xs font-semibold cursor-pointer"
                    >
                      Hide Explanation
                    </button>
                  )}

                  <button
                    onClick={() => setHintsRevealed({ ...hintsRevealed, [activeQuestionIndex]: !hintsRevealed[activeQuestionIndex] })}
                    style={SECONDARY_BTN_STYLE}
                    className="px-3.5 py-1.5 border rounded-[14px] text-xs font-semibold cursor-pointer"
                  >
                    {hintsRevealed[activeQuestionIndex] ? "Hide Hint" : "Get Hint"}
                  </button>

                  <button
                    onClick={handleFetchAlternativeExplanation}
                    disabled={loadingDiffExplain}
                    style={SECONDARY_BTN_STYLE}
                    className="px-3.5 py-1.5 border rounded-[14px] text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {loadingDiffExplain ? "Loading..." : "Explain Differently"}
                  </button>
                </div>

                {hintsRevealed[activeQuestionIndex] && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-700 rounded-[14px] text-xs text-slate-700 dark:text-slate-300">
                    <div className="font-semibold text-[#0B1F33] dark:text-white mb-0.5">Problem Hint:</div>
                    <p>{currentQuestion?.Hint || "Analyze key ratios first."}</p>
                  </div>
                )}

                {practiceRevealed[activeQuestionIndex] && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-700 rounded-[14px] text-xs space-y-2">
                    <div className="font-semibold text-[#0B1F33] dark:text-white">Explanation:</div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{currentQuestion?.Explanation}</p>
                    {currentQuestion?.ShortcutTip && (
                      <div className="pt-2 border-t border-[#D9E0E7] dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-[#0B1F33] dark:text-white">Shortcut: </span>
                        <span>{currentQuestion.ShortcutTip}</span>
                      </div>
                    )}
                  </div>
                )}

                {diffExplanations[activeQuestionIndex] && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-700 rounded-[14px] text-xs">
                    <div className="font-semibold text-[#0B1F33] dark:text-white mb-1">Alternative Explanation:</div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                      {diffExplanations[activeQuestionIndex]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Action Toolbar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-4 shadow-none">
            <button
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
              style={SECONDARY_BTN_STYLE}
              className="px-4 py-2 border rounded-[14px] text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>

            <div className="text-xs text-slate-500 hidden sm:block">
              {answeredCount} of {questions.length} answered
            </div>

            {activeQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                style={GRADIENT_BTN_STYLE}
                className="px-5 py-2 text-white font-semibold text-xs rounded-[14px] hover:opacity-95 transition-opacity cursor-pointer"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                style={GRADIENT_BTN_STYLE}
                className="px-5 py-2 text-white font-semibold text-xs rounded-[14px] hover:opacity-95 transition-opacity cursor-pointer"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Question Palette */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-5 shadow-none space-y-4 sticky top-6">
            <div className="text-xs font-semibold text-[#0B1F33] dark:text-white border-b border-[#D9E0E7] dark:border-slate-800 pb-2 flex justify-between">
              <span>Question Palette</span>
              <span className="text-slate-500 font-normal">{questions.length} Qs</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {questions.map((_, index) => {
                const isCurrent = activeQuestionIndex === index;
                const isAnswered = selectedAnswers[index] !== undefined;
                const isMarked = markedForReview[index];

                let buttonStyle = "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#D9E0E7] dark:border-slate-800";

                if (isMarked) {
                  buttonStyle = "bg-[#0B1F33] text-white border-[#0B1F33]";
                } else if (isAnswered) {
                  buttonStyle = "bg-slate-100 dark:bg-slate-800 text-[#0B1F33] dark:text-white font-semibold border-slate-300 dark:border-slate-700";
                }

                if (isCurrent) {
                  buttonStyle += " ring-2 ring-[#0B1F33] dark:ring-slate-100";
                }

                return (
                  <button
                    key={index}
                    onClick={() => setActiveQuestionIndex(index)}
                    className={`h-9 rounded-[10px] border text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${buttonStyle}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#D9E0E7] dark:border-slate-800">
              <button
                onClick={() => setShowSubmitModal(true)}
                style={SECONDARY_BTN_STYLE}
                className="w-full border font-semibold text-xs py-2 rounded-[14px] cursor-pointer"
              >
                Finish & Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 p-6 rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#0B1F33] dark:text-white">Confirm Submission</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to finish and submit your test?
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-700 rounded-[10px]">
              <div className="text-base font-bold text-[#0B1F33] dark:text-white">{answeredCount}</div>
              <div className="text-slate-500 text-[11px]">Answered</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-700 rounded-[10px]">
              <div className="text-base font-bold text-[#0B1F33] dark:text-white">{reviewCount}</div>
              <div className="text-slate-500 text-[11px]">Marked Review</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-700 rounded-[10px]">
              <div className="text-base font-bold text-[#0B1F33] dark:text-white">{unansweredCount}</div>
              <div className="text-slate-500 text-[11px]">Unanswered</div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setShowSubmitModal(false)}
              style={SECONDARY_BTN_STYLE}
              className="px-4 py-2 border text-xs font-semibold rounded-[14px] cursor-pointer"
            >
              Continue Test
            </button>
            <button
              disabled={submitting}
              onClick={() => executeSubmission(false)}
              style={GRADIENT_BTN_STYLE}
              className="px-5 py-2 text-white font-semibold text-xs rounded-[14px] cursor-pointer"
            >
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StartAptitudeTest;
