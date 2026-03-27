"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { db } from "@/utils/db";
import { Question } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Volume2 } from "lucide-react";
import { textToSpeech } from "@/utils/textToSpeech";

const page = ({ params }) => {
  const [questionData, setQuestionData] = useState();

  useEffect(() => {
    console.log(params.pyqId);
    getQuestionDetails();
  }, []);

  const getQuestionDetails = async () => {
    const result = await db
      .select()
      .from(Question)
      .where(eq(Question.mockId, params.pyqId));
    const questionData = JSON.parse(result[0].MockQuestionJsonResp);
    setQuestionData(questionData);
    // console.log("data", questionData);
  };



  return (
    questionData && (
      <div className="p-10 my-5">
        <Accordion type="single" collapsible>
          {questionData &&
            questionData.map((item, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index} className="mb-5"  >
                <div className="flex items-center justify-between">
                  <AccordionTrigger className="flex-1">{item?.Question}?</AccordionTrigger>
                  <Volume2
                    className="cursor-pointer hover:text-blue-600 transition-colors ml-2"
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      textToSpeech(item?.Question);
                    }}
                  />
                </div>
                <AccordionContent>{item?.Answer}</AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    )
  );
};

export default page;
