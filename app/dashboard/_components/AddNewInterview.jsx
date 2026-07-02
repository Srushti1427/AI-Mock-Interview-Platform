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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle, Plus, Zap } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddNewInterview = () => {
  const [openDailog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const InputPrompt = `
Job Position: ${jobPosition}
Job Description: ${jobDesc}
Years of Experience: ${jobExperience}

Return ONLY valid JSON.
Do NOT include explanations.
Do NOT use markdown.

Format:
[
  {
    "Question": "string",
    "Answer": "string"
  }
]
`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "generateInterview", jobPosition, jobDesc, jobExperience }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "AI generation failed");
      }

      const resultData = await res.json();
      console.log("API Response:", resultData);

      let parsed;
      try {
        if (resultData.data) {
          // Backend already parsed it for us
          parsed = resultData.data;
        } else if (resultData.cleanJson) {
          // Fallback if backend returned the raw JSON string
          parsed = JSON.parse(resultData.cleanJson);
        } else {
          throw new Error("Invalid payload missing data or cleanJson");
        }
        
        console.log("Successfully parsed interview questions:", parsed);
      } catch (error) {
        console.error("JSON parsing failed:", error, "Payload was:", resultData);
        setLoading(false);
        return;
      }

      setJsonResponse(parsed);

      const dataToStore = {
        mockId: uuidv4(),
        jsonMockResp: JSON.stringify(parsed),
        jobPosition: jobPosition,
        jobDesc: jobDesc,
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("YYYY-MM-DD"),
      };

      try {
        const createRes = await fetch('/api/interviews/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToStore),
        });
        if (!createRes.ok) {
          const txt = await createRes.text();
          throw new Error(txt || 'Failed to store interview');
        }
        const created = await createRes.json();
        setOpenDialog(false);
        router.push('/dashboard/interview/' + created.mockId);
      } catch (err) {
        console.error('Failed to store interview:', err);
        toast.error(`Interview save failed: ${err?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Something went wrong:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      <div
        onClick={() => setOpenDialog(true)}
        className="relative group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-strawberry to-salmon rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
        <div className="relative glass-effect rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-48 sm:min-h-64 group-hover:shadow-2xl group-hover:shadow-salmon/40/30 smooth-transition border-2 border-peach dark:border-strawberry-dark">
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-strawberry to-salmon rounded-full group-hover:scale-110 smooth-transition">
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 bg-gradient-to-r from-strawberry via-salmon to-peach dark:from-sky-300 dark:via-cyan-300 dark:to-blue-300 dark:bg-clip-text dark:text-transparent bg-clip-text text-transparent">
            Create New Interview
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-200 text-center">
            Start a new mock interview with AI
          </p>
          <div className="mt-3 sm:mt-4 flex gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs sm:text-sm text-amber-600 font-semibold">Powered by AI</span>
          </div>
        </div>
      </div>

      <Dialog open={openDailog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl glass-effect border-peach dark:border-strawberry-dark mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl gradient-text font-bold">
              Create Your Interview
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-200 mt-2">
              Tell us about the position you're preparing for. We'll generate custom interview questions powered by AI.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5 mt-4 sm:mt-6">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Job Role / Position
              </label>
              <Input
                placeholder="Ex. Full Stack Developer"
                required
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                className="rounded-xl border-peach focus:border-blue-900 focus:ring-blue-900 text-base py-2.5 sm:py-3"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Job Description / Tech Stack
              </label>
              <Textarea
                placeholder="Ex. React, Node.js, MySQL, Python, Docker, AWS"
                required
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="rounded-xl border-peach focus:border-blue-900 focus:ring-blue-900 min-h-20 sm:min-h-24 text-base"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-100 mb-1.5 sm:mb-2">
                Years of Experience
              </label>
              <Input
                placeholder="Ex. 5"
                max="50"
                type="number"
                required
                value={jobExperience}
                onChange={(e) => setJobExperience(e.target.value)}
                className="rounded-xl border-peach focus:border-blue-900 focus:ring-blue-900 text-base py-2.5 sm:py-3"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="rounded-xl text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-xl font-semibold py-2 sm:py-2.5 px-4 sm:px-6 flex gap-2 smooth-transition text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin w-4 h-4" />
                    Generating Interview...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Start Interview
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
