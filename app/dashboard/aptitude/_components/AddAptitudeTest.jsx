"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Plus, Zap } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddAptitudeTest = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/generateAptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!res.ok) throw new Error("API failed");
      const { rawText } = await res.json();
      
      try {
        const createRes = await fetch('/api/aptitude/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mockId: uuidv4(),
            jsonMockResp: rawText,
            topic,
            difficulty,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('YYYY-MM-DD'),
          }),
        });
        if (!createRes.ok) throw new Error(await createRes.text());
        const created = await createRes.json();
        if (created?.mockId) {
          setOpenDialog(false);
          router.push('/dashboard/aptitude/' + created.mockId + '/start');
        }
      } catch (err) {
        console.error(err);
        toast.error(`Failed to save test: ${err?.message || 'Database error'}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to generate test: ${error?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => setOpenDialog(true)}
        className="relative group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-strawberry to-salmon rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
        <div className="relative glass-effect rounded-2xl p-8 flex flex-col items-center justify-center min-h-64 group-hover:shadow-2xl group-hover:shadow-salmon/40/30 smooth-transition border-2 border-peach dark:border-strawberry-dark">
          <div className="mb-4 p-4 bg-gradient-to-r from-strawberry to-salmon rounded-full group-hover:scale-110 smooth-transition">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-strawberry via-salmon to-peach dark:from-sky-300 dark:via-cyan-300 dark:to-blue-300 dark:bg-clip-text dark:text-transparent bg-clip-text text-transparent">
            Create New Test
          </h2>
          <p className="text-gray-600 dark:text-gray-200 text-center text-sm">
            Generate an aptitude test with AI
          </p>
          <div className="mt-4 flex gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-600 font-semibold">Powered by AI</span>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl glass-effect border-peach dark:border-strawberry-dark">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text">Generate an Aptitude Test</DialogTitle>
            <DialogDescription asChild>
              <form onSubmit={onSubmit}>
                <div className="my-6 text-left">
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">Topic (e.g., React, Logical Reasoning)</label>
                    <Input
                      className="border-teal dark:border-mid focus:border-mid dark:focus:border-mid"
                      value={topic}
                      placeholder="Ex. Data Structures"
                      required
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">Difficulty</label>
                    <Input
                      className="border-teal dark:border-mid focus:border-mid dark:focus:border-mid"
                      value={difficulty}
                      placeholder="Ex. Easy, Medium, Hard"
                      required
                      onChange={(e) => setDifficulty(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenDialog(false)}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r from-teal to-mid hover:from-mid hover:to-darker text-white font-semibold smooth-transition"
                  >
                    {loading ? <><LoaderCircle className="animate-spin mr-2" /> Generating...</> : "Generate Test"}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddAptitudeTest;
