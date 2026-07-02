"use client";
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, Play } from 'lucide-react';

function AptitudeList() {
    const {user}=useUser();
    const [testList,setTestList]=useState([]);

    useEffect(()=>{
        user&&GetTestList();
    },[user])

    const GetTestList=async()=>{
        try {
            const res = await fetch('/api/aptitude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.primaryEmailAddress?.emailAddress }),
            });
            if (!res.ok) {
                console.error('Failed to fetch aptitude tests', await res.text());
                setTestList([]);
                return;
            }
            const data = await res.json();
            setTestList(data);
        } catch (err) {
            console.error(err);
            setTestList([]);
        }
    }

  return (
    <div>
        <h2 className='font-medium text-xl mb-3 text-foreground'>Previous Aptitude Tests</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {testList?.length > 0 ? testList.map((test,index)=>(
                <div key={index} className="group glass-effect border border-peach dark:border-strawberry-dark rounded-2xl overflow-hidden card-hover">
                    {/* Header with gradient */}
                    <div className="h-24 bg-gradient-to-r from-strawberry to-salmon relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-2 right-2 w-16 h-16 bg-white rounded-full blur-2xl"></div>
                        </div>
                        <div className="relative h-full flex items-end p-4">
                            <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur px-3 py-1 rounded-full">
                                <Zap className="w-4 h-4 text-salmon-dark" />
                                <span className="text-salmon-dark text-sm font-semibold">{test.difficulty}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <h2 className='font-bold text-lg gradient-text mb-1'>{test.topic}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Created: {test.createdAt}</p>

                        {/* Action Button */}
                        <Link href={'/dashboard/aptitude/'+test.mockId+'/start'} className='w-full'>
                            <Button 
                                className="w-full bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-xl smooth-transition font-semibold flex gap-2"
                            >
                                <Play className="w-4 h-4" />
                                Start Test
                            </Button>
                        </Link>
                    </div>
                </div>
            )) : (
                <div className="col-span-3 glass-effect border border-peach dark:border-strawberry-dark rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-100 mb-2">No tests yet</h3>
                    <p className="text-gray-600 dark:text-gray-200">Create your first aptitude test to get started</p>
                </div>
            )}
        </div>
    </div>
  )
}

export default AptitudeList
