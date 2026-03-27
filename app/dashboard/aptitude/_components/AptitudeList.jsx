"use client"
import { db } from '@/utils/db';
import { AptitudeTest } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AptitudeList() {
    const {user}=useUser();
    const [testList,setTestList]=useState([]);

    useEffect(()=>{
        user&&GetTestList();
    },[user])

    const GetTestList=async()=>{
        const result=await db.select()
        .from(AptitudeTest)
        .where(eq(AptitudeTest.createdBy,user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(AptitudeTest.id))

        setTestList(result);
    }

  return (
    <div>
        <h2 className='font-medium text-xl mb-3'>Previous Aptitude Tests</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 bg-card border border-border rounded-lg shadow-sm'>
            {testList?.length > 0 ? testList.map((test,index)=>(
                <div key={index} className='border border-border shadow-sm rounded-lg p-5 bg-background'>
                    <h2 className='font-bold text-primary'>{test.topic}</h2>
                    <h2 className='text-sm text-foreground'>Difficulty: {test.difficulty}</h2>
                    <h2 className='text-xs text-muted-foreground mt-2'>Created At: {test.createdAt}</h2>
                    <div className='flex gap-2 mt-4'>
                        <Link href={'/dashboard/aptitude/'+test.mockId+'/start'} className='w-full'>
                            <Button className="w-full" variant="outline" size="sm">Start Test</Button>
                        </Link>
                    </div>
                </div>
            )) : <p className="text-muted-foreground col-span-3">No aptitude tests generated yet.</p>}
        </div>
    </div>
  )
}

export default AptitudeList
