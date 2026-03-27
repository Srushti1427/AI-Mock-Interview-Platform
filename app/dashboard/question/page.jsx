import { UserButton } from "@clerk/nextjs";
import React from "react";
import AddQuestions from "../_components/AddQuestions";
import QuestionList from "../_components/QuestionList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const generalQuestions = [
  {
    question: "Tell me about yourself.",
    answer: "Keep your answer concise and focused on your professional journey. Start with a brief overview of your current role, highlight 2-3 key achievements or experiences that are relevant to the job you're applying for, and conclude with how your background makes you a great fit for this new opportunity."
  },
  {
    question: "Why do you want to work here?",
    answer: "Show that you've done your research. Mention specific things about the company's products, culture, or recent achievements that impress you. Connect their goals with your own career aspirations and explain how you can bring value to their team."
  },
  {
    question: "What are your greatest strengths?",
    answer: "Choose 1-2 strengths that directly relate to the job description. Provide a brief, specific example or story that demonstrates each strength in action rather than just stating you possess it."
  },
  {
    question: "What do you consider to be your weaknesses?",
    answer: "Be honest but strategic. Choose a real weakness that isn't a core requirement for the job. Most importantly, explain the proactive steps you are currently taking to improve upon it to show self-awareness and a growth mindset."
  },
  {
    question: "Describe a challenge or conflict you faced at work, and how you dealt with it.",
    answer: "Use the STAR method (Situation, Task, Action, Result). Focus on resolving the issue professionally and calmly. Emphasize your communication skills, empathy, and your ability to find a constructive solution without blaming others."
  },
  {
    question: "Where do you see yourself in five years?",
    answer: "Align your future goals with the role and the company's trajectory. Show ambition and a desire to learn and grow, while making it clear that this position is a logical and exciting step in your long-term career path."
  },
  {
    question: "Why should we hire you?",
    answer: "Summarize your top 3 qualifications that make you the perfect fit. Speak directly to the job description and the employer's needs, and express your genuine enthusiasm for the position."
  },
  {
    question: "Tell me about a time you made a mistake.",
    answer: "Focus on the lesson learned rather than the error itself. Briefly explain the mistake, take full accountability without blaming others, and detail the steps you took to fix it and ensure it never happens again."
  },
  {
    question: "What is your greatest professional achievement?",
    answer: "Use the STAR method to describe a specific achievement you're proud of. Quantify your results whenever possible (e.g., 'increased sales by 20%', 'saved 10 hours of work per week')."
  },
  {
    question: "How do you handle stress and pressure?",
    answer: "Provide a specific example of a stressful situation you navigated successfully. Mention your coping strategies, such as prioritizing tasks, breaking down large projects, or taking a moment to breathe and assess the situation."
  },
  {
    question: "What are your salary expectations?",
    answer: "Do your research beforehand. Give a salary range rather than a specific number, and express that you are flexible and that the total compensation package (benefits, remote work, bonuses) is also important to you."
  },
  {
    question: "Do you have any questions for us?",
    answer: "Always say yes! Have 2-3 prepared questions about the company culture, the daily responsibilities of the role, or the company's future goals. This shows you are engaged and genuinely interested in the opportunity."
  }
];

const Questions = () => {
  return (
    <div className="p-10" >
      <h2 className="font-bold text-2xl" >Master Your Interviews</h2>
      <h2 className="text-gray-500" >Comprehensive Question Preparation with AI</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 my-5" >
        <AddQuestions/>
      </div>

      <QuestionList/>

      <div className="mt-12 bg-slate-50 dark:bg-slate-900 border rounded-lg p-6">
        <h3 className="font-bold text-xl mb-4">Common Interview Questions</h3>
        <p className="text-gray-500 mb-6">Review these frequently asked questions and practice your answers before starting a mock interview.</p>
        <Accordion type="single" collapsible className="w-full">
          {generalQuestions.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold">{item.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Questions;