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
import { LoaderCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { AptitudeTest } from "@/utils/schema";
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
      
      const resp = await db
        .insert(AptitudeTest)
        .values({
          mockId: uuidv4(),
          jsonMockResp: rawText,
          topic: topic,
          difficulty: difficulty,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("YYYY-MM-DD"),
        })
        .returning({ mockId: AptitudeTest.mockId });

      if (resp && resp[0]?.mockId) {
        setOpenDialog(false);
        router.push("/dashboard/aptitude/" + resp[0].mockId + "/start");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate test. Make sure the database schema is pushed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 rounded-lg border border-border bg-secondary hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center text-secondary-foreground font-semibold">+ Create New Test</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate an Aptitude Test</DialogTitle>
            <DialogDescription asChild>
              <form onSubmit={onSubmit}>
                <div className="my-3 text-left">
                  <div className="mt-7 my-3">
                    <label className="text-foreground font-medium">Topic (e.g., React, Logical Reasoning)</label>
                    <Input
                      className="mt-1"
                      value={topic}
                      placeholder="Ex. Data Structures"
                      required
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="my-4">
                    <label className="text-foreground font-medium">Difficulty</label>
                    <Input
                      className="mt-1"
                      value={difficulty}
                      placeholder="Ex. Easy, Medium, Hard"
                      required
                      onChange={(e) => setDifficulty(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
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
