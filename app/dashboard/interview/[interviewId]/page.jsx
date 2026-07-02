"use client";
import { Lightbulb, WebcamIcon } from "lucide-react";
import React, { useEffect, useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import Link from "next/link";
import { WebCamContext } from "../../layout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Interview = ({ params }) => {
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const [interviewData, setInterviewData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleStartInterview = () => {
    if (!webCamEnabled) {
      alert("Please enable the camera to start the interview.");
    } else {
      router.push("/dashboard/interview/" + params.interviewId + "/start");
    }
  };

  useEffect(() => {
    console.log(params.interviewId);
    GetInterviewDetails();
  }, []);
  
  const GetInterviewDetails = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/interviews/${params.interviewId}`);
      if (!res.ok) {
        console.error('Failed to fetch interview', await res.text());
        return;
      }
      const record = await res.json();
      setInterviewData(record);
    } catch (err) {
      console.error('Error fetching interview details:', err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="my-10">
      <h2 className="font-bold text-2xl text-center">Let's Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 ">
        <div className="flex flex-col my-5 gap-5">
          <div className="flex flex-col p-5 rounded-lg border gap-5">
            {isLoading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <h2 className="text-lg">
                  <strong>Job Role/Job Position: </strong>
                  {interviewData?.jobPosition}
                </h2>
                <h2 className="text-lg">
                  <strong>Job Description/Job Stack: </strong>
                  {interviewData?.jobDesc}
                </h2>
                <h2 className="text-lg">
                  <strong>Years of Experience: </strong>
                  {interviewData?.jobExperience}
                </h2>
              </>
            )}
          </div>
          <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-700 mb-2">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="mt-3 text-yellow-500">
              {process.env.NEXT_PUBLIC_INFORMATION}
            </h2>
          </div>
        </div>
        <div>
          {webCamEnabled ? (
            <div className=" flex items-center justify-center p-10">
              <Webcam
                onUserMedia={() => setWebCamEnabled(true)}
                onUserMediaError={() => setWebCamEnabled(false)}
                height={300}
                width={300}
                mirrored={true}
              />
            </div>
          ) : (
            <div>
              <WebcamIcon className="h-72 w-full my-6 p-20 bg-secondary rounded-lg border" />
            </div>
          )}
          <div>
            <Button
              className={`${webCamEnabled ? "w-full" : "w-full"}`}
              onClick={() => setWebCamEnabled((prev) => !prev)}
            >
              {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <Button onClick={handleStartInterview} className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-full shadow-lg shadow-salmon/40 transform hover:scale-105 transition-all">
          Start Interview
        </Button>
      </div>
    </div>
  );
};

export default Interview;
