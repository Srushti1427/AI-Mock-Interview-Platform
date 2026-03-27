"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Mic, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
// Server-side Gemini endpoints will handle AI calls and DB writes
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { WebCamContext } from "@/app/dashboard/layout";
import { useRouter } from "next/navigation";
const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  onAnswerSaved,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recordingPath, setRecordingPath] = useState("");
  const [showRecordingReview, setShowRecordingReview] = useState(false);
  const audioRef = useRef(null);

  const router = useRouter();
  const warningCountRef = useRef(0);

  const handleWarning = (msg) => {
    warningCountRef.current += 1;
    if (warningCountRef.current >= 5) {
      toast.error("Interview Ended: Don't repeat the malpractice again", {
        style: { padding: "24px", fontSize: "20px", fontWeight: "bold" },
      });
      router.replace("/dashboard");
    } else {
      toast.error(`${msg} (Warning ${warningCountRef.current}/5)`, {
        style: { padding: "20px", fontSize: "18px" },
      });
    }
  };

  // Face detection specific hooks
  const webcamRef = useRef(null);
  const [faceModel, setFaceModel] = useState(null);
  const faceDetectionIntervalRef = useRef(null);

  useEffect(() => {
    const loadFaceModel = async () => {
      try {
        await tf.ready();
        const model = await blazeface.load();
        setFaceModel(model);
        console.log("Blazeface model loaded");
      } catch (error) {
        console.error("Error loading face detection model:", error);
      }
    };
    loadFaceModel();
  }, []);

  useEffect(() => {
    if (webCamEnabled && faceModel) {
      faceDetectionIntervalRef.current = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          try {
            const predictions = await faceModel.estimateFaces(video, false);
            if (predictions.length === 0) {
              handleWarning("Face not detected. Please stay in the frame.");
            } else if (predictions.length > 1) {
              handleWarning("Multiple faces detected. Please ensure you are alone.");
            }
          } catch (err) {
            console.error("Face detection error:", err);
          }
        }
      }, 3000);
    } else {
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
      }
    }

    return () => {
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
      }
    };
  }, [webCamEnabled, faceModel]);

  // Tab switching and focus loss detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleWarning("Tab switch or minimization detected. Please do not switch tabs during the interview.");
      }
    };

    const handleBlur = () => {
      handleWarning("Window lost focus. Please keep the interview window active.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Save answer when moving to a different question
  useEffect(() => {
    if (activeQuestionIndex in answeredQuestions && !userAnswer) {
      // Load previously saved answer for this question
      setUserAnswer(answeredQuestions[activeQuestionIndex]);
    } else if (!(activeQuestionIndex in answeredQuestions)) {
      // Clear input for new question
      setUserAnswer("");
    }
  }, [activeQuestionIndex, answeredQuestions]);

  // Auto-save answer when enough text is entered
  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      // Mark this question as answered
      setAnsweredQuestions((prev) => ({
        ...prev,
        [activeQuestionIndex]: userAnswer,
      }));
      updateUserAnswer();
    }
  }, [userAnswer]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast("Error starting recording. Please check your microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setLoading(true);
      // Convert audio blob to base64 and send to server for transcription + saving
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result.split(",")[1];

          const res = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64Audio,
              interviewId: interviewData?.mockId,
              userEmail: user?.primaryEmailAddress?.emailAddress,
            }),
          });

          if (!res.ok) {
            const err = await res.text();
            throw new Error(err || "Transcription failed");
          }

          const json = await res.json();
          console.log("Transcription response:", json);
          setUserAnswer((prev) => prev + " " + (json.transcription || ""));
          if (json.filePath) {
            console.log("Setting recordingPath to:", json.filePath);
            setRecordingPath(json.filePath);
            toast("Recording saved successfully!");
          }
        } catch (e) {
          console.error("Transcription error:", e);
          toast("Error transcribing audio. Please try again.");
        } finally {
          setLoading(false);
        }
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast("Error transcribing audio. Please try again.");
      setLoading(false);
    }
  };

  const updateUserAnswer = async () => {
    try {
      setLoading(true);

      const currentQuestion = mockInterviewQuestion[activeQuestionIndex];

      console.log("Saving answer for Question #" + (activeQuestionIndex + 1), {
        question: currentQuestion?.Question?.substring(0, 50) + "...",
        answer: userAnswer?.substring(0, 50) + "...",
        interviewId: interviewData?.mockId,
      });

      // Send transcription + question to server; server will call the Gemini model
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion?.Question,
          correctAns: currentQuestion?.Answer,
          userAnswer,
          interviewData,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Feedback API error:", txt);
        throw new Error(txt || "Failed to get feedback");
      }

      const json = await res.json();
      console.log("Answer saved successfully for Question #" + (activeQuestionIndex + 1));

      if (json.success) {
        toast("Answer recorded successfully!");
        if (json.nextQuestion && onAnswerSaved) {
          onAnswerSaved(json.nextQuestion);
        }
      }

      // Don't clear the answer immediately - let user review before moving to next
      setLoading(false);
    } catch (error) {
      console.error("Error saving answer:", error);
      toast("An error occurred while recording the user answer");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col justify-center items-center rounded-lg p-5 bg-black mt-4 w-[30rem] ">
        {webCamEnabled ? (
          <Webcam
            mirrored={true}
            ref={webcamRef}
            style={{ height: 250, width: "100%", zIndex: 10 }}
          />
        ) : (
          <Image src={"/camera.jpg"} width={200} height={200} alt="Camera placeholder" />
        )}
      </div>
      <div className="md:flex mt-4 md:mt-8 md:gap-5">
        <div className="my-4 md:my-0">
          <Button onClick={() => setWebCamEnabled((prev) => !prev)}>
            {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
        >
          {isRecording ? (
            <h2 className="text-red-400 flex gap-2 ">
              <Mic /> Stop Recording...
            </h2>
          ) : (
            " Record Answer"
          )}
        </Button>
        {recordingPath && (
          <Button
            variant="secondary"
            onClick={() => setShowRecordingReview(!showRecordingReview)}
          >
            <Play className="mr-2 w-4 h-4" /> Review Recording
          </Button>
        )}
      </div>

      {showRecordingReview && recordingPath && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg w-[30rem] border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">Your Recording</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                }
              }}
              title="Restart playback"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <audio
            ref={audioRef}
            src={recordingPath}
            controls
            className="w-full rounded bg-gray-800 focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-2">
            Review your answer before proceeding to the next question
          </p>
        </div>
      )}
      {/* Check transcription code */}
      {/* {userAnswer && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold">Transcribed Answer:</h3>
          <p>{userAnswer}</p>
        </div>
      )} */}
    </div>
  );
};

export default RecordAnswerSection;


















// "use client";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import React, { useContext, useEffect, useState } from "react";
// import Webcam from "react-webcam";
// import useSpeechToText from "react-hook-speech-to-text";
// import { Mic } from "lucide-react";
// import { toast } from "sonner";
// import { chatSession } from "@/utils/GeminiAIModal";
// import { db } from "@/utils/db";
// import { UserAnswer } from "@/utils/schema";
// import { useUser } from "@clerk/nextjs";
// import moment from "moment";
// import { WebCamContext } from "@/app/dashboard/layout";

// const RecordAnswerSection = ({
//   mockInterviewQuestion,
//   activeQuestionIndex,
//   interviewData,
// }) => {
//   const [userAnswer, setUserAnswer] = useState("");
//   const { user } = useUser();
//   const [loading, setLoading] = useState(false);
//   const {
//     error,
//     interimResult,
//     isRecording,
//     results,
//     startSpeechToText,
//     stopSpeechToText,
//     setResults,
//   } = useSpeechToText({
//     continuous: true,
//     useLegacyResults: false,
//   });
//   const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);

//   useEffect(() => {
//     results.map((result) =>
//       setUserAnswer((prevAns) => prevAns + result?.transcript)
//     );
//   }, [results]);

//   useEffect(() => {
//     if (!isRecording && userAnswer.length > 10) {
//       updateUserAnswer();
//     }
//     // if (userAnswer?.length < 10) {
//     //   setLoading(false);
//     //   toast("Error while saving your answer, Please record again");
//     //   return;
//     // }
//   }, [userAnswer]);

//   const StartStopRecording = async () => {
//     if (isRecording) {
//       stopSpeechToText();
//     } else {
//       startSpeechToText();
//     }
//   };

//   const updateUserAnswer = async () => {
//     try {
//       console.log(userAnswer);
//       setLoading(true);
//       const feedbackPrompt =
//         "Question:" +
//         mockInterviewQuestion[activeQuestionIndex]?.Question +
//         ", User Answer:" +
//         userAnswer +
//         " , Depends on question and user answer for given interview question" +
//         " please give us rating for answer and feedback as area of improvement if any " +
//         "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

//       const result = await chatSession.sendMessage(feedbackPrompt);

//       let MockJsonResp = result.response.text();
//       console.log(MockJsonResp);

//       // Removing possible extra text around JSON
//       MockJsonResp = MockJsonResp.replace("```json", "").replace("```", "");

//       // Attempt to parse JSON
//       let jsonFeedbackResp;
//       try {
//         jsonFeedbackResp = JSON.parse(MockJsonResp);
//       } catch (e) {
//         throw new Error("Invalid JSON response: " + MockJsonResp);
//       }

//       const resp = await db.insert(UserAnswer).values({
//         mockIdRef: interviewData?.mockId,
//         question: mockInterviewQuestion[activeQuestionIndex]?.Question,
//         correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
//         userAns: userAnswer,
//         feedback: jsonFeedbackResp?.feedback,
//         rating: jsonFeedbackResp?.rating,
//         userEmail: user?.primaryEmailAddress?.emailAddress,
//         createdAt: moment().format("YYYY-MM-DD"),
//       });

//       if (resp) {
//         toast("User Answer recorded successfully");
//       }
//       setUserAnswer("");
//       setResults([]);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       toast("An error occurred while recording the user answer");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center overflow-hidden">
//       <div className="flex flex-col justify-center items-center rounded-lg p-5 bg-black mt-4 w-[30rem] ">
//         {webCamEnabled ? (
//           <Webcam
//             mirrored={true}
//             style={{ height: 250, width: "100%", zIndex: 10 }}
//           />
//         ) : (
//           <Image src={"/camera.jpg"} width={200} height={200} />
//         )}
//       </div>
//       <div className="md:flex  mt-4 md:mt-8 md:gap-5">
//         <div className="my-4 md:my-0">
//           <Button
//             // className={`${webCamEnabled ? "w-full" : "w-full"}`}
//             onClick={() => setWebCamEnabled((prev) => !prev)}
//           >
//             {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
//           </Button>
//         </div>
//         <Button
//           varient="outline"
//           // className="my-10"
//           onClick={StartStopRecording}
//           disabled={loading}
//         >
//           {isRecording ? (
//             <h2 className="text-red-400 flex gap-2 ">
//               <Mic /> Stop Recording...
//             </h2>
//           ) : (
//             " Record Answer"
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default RecordAnswerSection;
