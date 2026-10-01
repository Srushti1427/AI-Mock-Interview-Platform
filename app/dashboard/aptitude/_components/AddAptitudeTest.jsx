"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  APTITUDE_CATEGORIES,
  APTITUDE_PRESETS,
  DIFFICULTY_LEVELS,
  QUESTION_COUNTS,
} from "@/utils/aptitudeConstants";

const GRADIENT_BTN_STYLE = {
  background: "linear-gradient(90deg, #05080B 0%, #365F87 100%)",
};

const SECONDARY_BTN_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#D9E0E7",
  color: "#0B1F33",
};

const AddAptitudeTest = ({ openCustomDialog, setOpenCustomDialog }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const openDialog = openCustomDialog !== undefined ? openCustomDialog : internalOpen;
  const setOpenDialog = setOpenCustomDialog !== undefined ? setOpenCustomDialog : setInternalOpen;

  const [category, setCategory] = useState("Quantitative Aptitude");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [mode, setMode] = useState("test");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleApplyPreset = (preset) => {
    setCategory(preset.category);
    setDifficulty(preset.difficulty);
    setQuestionCount(preset.questionCount);
    setTimeLimit(preset.timeLimit);
    setNegativeMarking(preset.negativeMarking);
    setMode(preset.mode);
    setCustomTopic("");
    toast.success(`Applied "${preset.title}" preset`);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedTopic = customTopic.trim() || category;

    try {
      const res = await fetch("/api/generateAptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          category,
          difficulty,
          questionCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate questions");
      }

      const { questions, rawText } = await res.json();

      if (!questions || questions.length === 0) {
        throw new Error("No valid questions generated");
      }

      const mockId = uuidv4();

      const createRes = await fetch("/api/aptitude/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mockId,
          topic: selectedTopic,
          category,
          difficulty,
          mode,
          questionCount: questions.length,
          timeLimit,
          negativeMarking,
          questions,
          jsonMockResp: rawText,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!createRes.ok) {
        const createErr = await createRes.json().catch(() => ({}));
        throw new Error(createErr.error || "Failed to save test");
      }

      const created = await createRes.json();
      if (created?.mockId) {
        setOpenDialog(false);
        toast.success("Aptitude test created!");
        router.push(`/dashboard/aptitude/${created.mockId}/start`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to generate test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-white dark:bg-slate-900 border border-[#D9E0E7] dark:border-slate-800 shadow-none rounded-[14px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#0B1F33]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-[#0B1F33] dark:text-white">
            Configure Aptitude Test
          </DialogTitle>
          <DialogDescription className="text-xs text-[#5A6E85] mt-1">
            Choose a preset or customize category, question count, and time limit.
          </DialogDescription>
        </DialogHeader>

        {/* Quick Presets */}
        <div className="mb-5">
          <div className="text-[11px] font-semibold text-[#5A6E85] uppercase tracking-wider mb-2">
            Quick Presets
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {APTITUDE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-3 text-left border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] bg-white dark:bg-slate-900 hover:border-slate-400 transition-colors text-xs cursor-pointer"
              >
                <div className="font-semibold text-[#0B1F33] dark:text-white">{preset.title}</div>
                <div className="text-[#5A6E85] text-[11px] mt-0.5">
                  {preset.questionCount} Qs • {preset.timeLimit}m
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Category selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F33] dark:text-slate-100 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-[#0B1F33] dark:text-slate-100 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] px-3 py-2 text-xs focus:outline-none focus:border-slate-400"
              >
                {APTITUDE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F33] dark:text-slate-100 mb-1">
                Sub-Topic (Optional)
              </label>
              <Input
                value={customTopic}
                placeholder="e.g. Speed & Distance"
                onChange={(e) => setCustomTopic(e.target.value)}
                className="bg-white dark:bg-slate-900 border-[#D9E0E7] dark:border-slate-800 text-xs py-2 rounded-[14px]"
              />
            </div>
          </div>

          {/* Difficulty & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F33] dark:text-slate-100 mb-1">
                Difficulty
              </label>
              <div className="grid grid-cols-4 gap-1">
                {DIFFICULTY_LEVELS.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 text-xs font-medium rounded-[14px] border transition-colors cursor-pointer ${
                      difficulty === diff
                        ? "bg-[#0B1F33] text-white border-[#0B1F33]"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-[#D9E0E7] dark:border-slate-800"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F33] dark:text-slate-100 mb-1">
                Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("test")}
                  className={`p-2 text-left border rounded-[14px] transition-colors cursor-pointer ${
                    mode === "test"
                      ? "border-[#0B1F33] bg-slate-50 dark:bg-slate-800 font-semibold text-[#0B1F33] dark:text-white"
                      : "border-[#D9E0E7] dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="text-xs">Test Mode</div>
                  <div className="text-[10px] text-slate-500">Timed exam format</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("practice")}
                  className={`p-2 text-left border rounded-[14px] transition-colors cursor-pointer ${
                    mode === "practice"
                      ? "border-[#0B1F33] bg-slate-50 dark:bg-slate-800 font-semibold text-[#0B1F33] dark:text-white"
                      : "border-[#D9E0E7] dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="text-xs">Practice Mode</div>
                  <div className="text-[10px] text-slate-500">Instant explanations</div>
                </button>
              </div>
            </div>
          </div>

          {/* Questions & Time Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F33] dark:text-slate-100 mb-1">
                Questions
              </label>
              <div className="grid grid-cols-4 gap-1">
                {QUESTION_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-1.5 text-xs font-medium rounded-[14px] border transition-colors cursor-pointer ${
                      questionCount === cnt
                        ? "bg-[#0B1F33] text-white border-[#0B1F33]"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-[#D9E0E7] dark:border-slate-800"
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F33] dark:text-slate-100 mb-1">
                Time Limit
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[10, 15, 30, 45].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeLimit(t)}
                    className={`py-1.5 text-xs font-medium rounded-[14px] border transition-colors cursor-pointer ${
                      timeLimit === t
                        ? "bg-[#0B1F33] text-white border-[#0B1F33]"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-[#D9E0E7] dark:border-slate-800"
                    }`}
                  >
                    {t} mins
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Negative Marking Option */}
          <div className="p-3 border border-[#D9E0E7] dark:border-slate-800 rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-[#0B1F33] dark:text-white">Negative Marking (-0.25)</div>
              <div className="text-[11px] text-slate-500">
                Deduct 0.25 marks per incorrect answer.
              </div>
            </div>
            <input
              type="checkbox"
              checked={negativeMarking}
              onChange={(e) => setNegativeMarking(e.target.checked)}
              className="w-4 h-4 text-[#0B1F33] rounded border-slate-300 focus:ring-[#0B1F33] cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end pt-3 border-t border-[#D9E0E7] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOpenDialog(false)}
              style={SECONDARY_BTN_STYLE}
              className="px-4 py-2 text-xs font-semibold border rounded-[14px] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={GRADIENT_BTN_STYLE}
              className="text-white font-semibold text-xs px-5 py-2 rounded-[14px] hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin w-3.5 h-3.5" />
                  Generating...
                </>
              ) : (
                "Start Test"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAptitudeTest;
