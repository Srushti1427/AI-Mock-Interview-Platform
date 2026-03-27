import React from 'react'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { MessageCircle, Play, ChevronRight,Briefcase } from 'lucide-react';

const InterviewItemCard = ({interview}) => {
    const router = useRouter()
    
    const onStart = ()=>{
        router.push("/dashboard/interview/"+interview?.mockId)
    }
    
    const onFeedback = ()=>{
        router.push("/dashboard/interview/"+interview?.mockId+"/feedback")
    }

  return (
    <div className="group glass-effect border border-peach dark:border-strawberry-dark rounded-2xl overflow-hidden card-hover">
        {/* Header with gradient */}
        <div className="h-24 bg-gradient-to-r from-strawberry to-salmon relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 right-2 w-16 h-16 bg-white rounded-full blur-2xl"></div>
            </div>
            <div className="relative h-full flex items-end p-4">
                <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur px-3 py-1 rounded-full">
                    <Briefcase className="w-4 h-4 text-salmon-dark" />
                    <span className="text-salmon-dark text-sm font-semibold">{interview?.jobExperience} yrs</span>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-5">
            <h2 className='font-bold text-lg gradient-text mb-1'>{interview?.jobPosition}</h2>
            <p className='text-xs text-gray-600 dark:text-gray-400 mb-3'>{interview?.jobDesc?.substring(0, 50)}...</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Created: {interview?.createdAt}</p>

            {/* Action Buttons */}
            <div className='flex gap-3 justify-between'>
                <Button 
                    onClick={onFeedback} 
                    className="flex-1 bg-gradient-to-r from-black to-salmon hover:from-slate-900 hover:to-salmon-dark text-white rounded-xl smooth-transition font-semibold flex gap-2"
                >
                    <MessageCircle className="w-4 h-4" />
                    Feedback
                </Button>
                <Button 
                    onClick={onStart} 
                    className="flex-1 bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-xl smooth-transition font-semibold flex gap-2"
                >
                    <Play className="w-4 h-4" />
                    Start
                </Button>
            </div>
        </div>
    </div>
  )
}

export default InterviewItemCard