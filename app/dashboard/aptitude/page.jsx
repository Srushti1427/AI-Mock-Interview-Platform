"use client";
import React, { useEffect, useState } from "react";
import AddAptitudeTest from "./_components/AddAptitudeTest";
import AptitudeList from "./_components/AptitudeList";
import { LoaderCircle } from "lucide-react";
import { APTITUDE_CATEGORIES, APTITUDE_PRESETS } from "@/utils/aptitudeConstants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";

const GRADIENT_BTN_STYLE = {
  background: "linear-gradient(90deg, #05080B 0%, #365F87 100%)",
};

export default function AptitudePage() {
  const [openCustomDialog, setOpenCustomDialog] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [dailyData, setDailyData] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [launchingTest, setLaunchingTest] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
    fetchDailyChallenge();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch("/api/aptitude/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchDailyChallenge = async () => {
    try {
      setLoadingDaily(true);
      const res = await fetch("/api/aptitude/daily");
      if (res.ok) {
        const data = await res.json();
        setDailyData(data);
      }
    } catch (err) {
      console.error("Failed to fetch daily challenge:", err);
    } finally {
      setLoadingDaily(false);
    }
  };

  const handleLaunchPreset = async (preset) => {
    try {
      setLaunchingTest(true);
      toast.info(`Generating "${preset.title}"...`);

      const res = await fetch("/api/generateAptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: preset.title,
          category: preset.category,
          difficulty: preset.difficulty,
          questionCount: preset.questionCount,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate questions");
      const { questions, rawText } = await res.json();

      const mockId = uuidv4();
      const createRes = await fetch("/api/aptitude/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mockId,
          topic: preset.title,
          category: preset.category,
          difficulty: preset.difficulty,
          mode: preset.mode,
          questionCount: questions.length,
          timeLimit: preset.timeLimit,
          negativeMarking: preset.negativeMarking,
          questions,
          jsonMockResp: rawText,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!createRes.ok) throw new Error("Failed to create test entry");
      router.push(`/dashboard/aptitude/${mockId}/start`);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to launch test preset");
    } finally {
      setLaunchingTest(false);
    }
  };

  const handleLaunchDaily = () => {
    if (dailyData?.mockId) {
      router.push(`/dashboard/aptitude/${dailyData.mockId}/start`);
    }
  };

  const handlePracticeWeakAreas = async () => {
    if (!analytics?.weakestCategories || analytics.weakestCategories.length === 0) {
      toast.info("No weak areas detected yet! Take a test first.");
      setOpenCustomDialog(true);
      return;
    }

    const weakCat = analytics.weakestCategories[0]?.category || "Quantitative Aptitude";
    handleLaunchPreset({
      title: `Practice Weak Area: ${weakCat}`,
      category: weakCat,
      difficulty: "Adaptive",
      questionCount: 10,
      timeLimit: 15,
      negativeMarking: false,
      mode: "practice",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[#0B1F33]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#D9E0E7]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F33] dark:text-white">
            Aptitude Preparation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Sharpen your quantitative, logical, and verbal skills through structured practice and tests.
          </p>
        </div>

        <div>
          <button
            onClick={() => setOpenCustomDialog(true)}
            style={GRADIENT_BTN_STYLE}
            className="w-full sm:w-auto text-white font-semibold text-sm px-5 py-2.5 rounded-[14px] shadow-none hover:opacity-95 transition-opacity cursor-pointer"
          >
            + Configure Custom Test
          </button>
        </div>
      </div>

      {/* Top Section: Daily Challenge & Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenge Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-6 shadow-none flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#5A6E85] uppercase">
              <span>Daily Challenge</span>
              <span>5 Questions</span>
            </div>

            <h3 className="text-xl font-bold text-[#0B1F33] dark:text-white mt-3">
              Today's Aptitude Workout
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              5 questions to keep your preparation consistent.
            </p>
          </div>

          <div className="pt-2">
            {dailyData?.isCompleted ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] text-xs text-[#0B1F33] dark:text-slate-300 font-medium flex items-center justify-between mb-3">
                <span>Completed today</span>
                <span>Score: {dailyData.score}/5</span>
              </div>
            ) : null}

            <button
              onClick={handleLaunchDaily}
              disabled={loadingDaily || launchingTest}
              style={GRADIENT_BTN_STYLE}
              className="w-full text-white font-semibold text-xs py-2.5 rounded-[14px] shadow-none hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingDaily ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : dailyData?.isCompleted ? (
                "Review Today's Challenge"
              ) : (
                "Start Challenge"
              )}
            </button>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-6 shadow-none flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#5A6E85] uppercase">
              Performance
            </div>

            {loadingAnalytics ? (
              <div className="h-20 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-[14px] mt-3" />
            ) : (
              <div className="mt-3 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-left">
                  <div>
                    <div className="text-[11px] font-medium text-[#5A6E85] uppercase tracking-wider">
                      Accuracy
                    </div>
                    <div className="text-xl font-bold text-[#0B1F33] dark:text-white mt-0.5">
                      {analytics?.hasHistory ? `${analytics.averageAccuracy}%` : "0%"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-[#5A6E85] uppercase tracking-wider">
                      Tests
                    </div>
                    <div className="text-xl font-bold text-[#0B1F33] dark:text-white mt-0.5">
                      {analytics?.totalTests || 0}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-[#5A6E85] uppercase tracking-wider">
                      Questions
                    </div>
                    <div className="text-xl font-bold text-[#0B1F33] dark:text-white mt-0.5">
                      {analytics?.totalQuestionsSolved || 0}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D9E0E7] dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[#5A6E85] font-medium">Weak Area:</span>
                  <span className="font-semibold text-[#0B1F33] dark:text-white">
                    {analytics?.weakestCategories?.[0]?.category || "None detected"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={handlePracticeWeakAreas}
              disabled={launchingTest}
              style={GRADIENT_BTN_STYLE}
              className="w-full text-white font-semibold text-xs py-2.5 rounded-[14px] shadow-none hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {launchingTest ? <LoaderCircle className="w-4 h-4 animate-spin" /> : "Practice Weak Area"}
            </button>
          </div>
        </div>
      </div>

      {/* Placement Presets */}
      <div className="space-y-3">
        <div className="text-xs font-semibold tracking-wider text-[#5A6E85] uppercase">
          Placement Presets
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {APTITUDE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] p-5 shadow-none flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-[#5A6E85]">{preset.category}</span>
                  <span className="text-slate-400">{preset.difficulty}</span>
                </div>

                <h3 className="font-bold text-base text-[#0B1F33] dark:text-white">
                  {preset.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => handleLaunchPreset(preset)}
                disabled={launchingTest}
                style={GRADIENT_BTN_STYLE}
                className="w-full text-white font-semibold text-xs py-2.5 rounded-[14px] shadow-none hover:opacity-95 transition-opacity text-center disabled:opacity-50 cursor-pointer"
              >
                {launchingTest ? "Generating..." : `Launch Test (${preset.questionCount} Qs)`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Explore Categories */}
      <div className="space-y-3">
        <div className="text-xs font-semibold tracking-wider text-[#5A6E85] uppercase">
          Explore Categories
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {APTITUDE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                handleLaunchPreset({
                  title: cat,
                  category: cat,
                  difficulty: "Medium",
                  questionCount: 10,
                  timeLimit: 15,
                  negativeMarking: false,
                  mode: "test",
                })
              }
              disabled={launchingTest}
              className="p-3.5 text-left bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-[14px] transition-colors cursor-pointer"
            >
              <div className="font-medium text-xs text-[#0B1F33] dark:text-white line-clamp-1">{cat}</div>
              <div className="text-[11px] text-slate-400 mt-1">Start Practice →</div>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="pt-2">
        <AptitudeList />
      </div>

      {/* Custom Test Modal */}
      <AddAptitudeTest
        openCustomDialog={openCustomDialog}
        setOpenCustomDialog={setOpenCustomDialog}
      />
    </div>
  );
}
