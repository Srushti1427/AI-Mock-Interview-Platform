import React from 'react'
import AddAptitudeTest from './_components/AddAptitudeTest'
import AptitudeList from './_components/AptitudeList'

const AptitudePage = () => {
  return (
    <div className='p-10'>
        <h2 className='font-bold text-3xl mb-2 text-foreground'>Aptitude Tests</h2>
        <h2 className='text-muted-foreground mb-8'>Generate custom topic-based multiple choice tests to sharpen your skills.</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 my-5 mb-12'>
            <AddAptitudeTest />
        </div>
        
        <AptitudeList />
    </div>
  )
}

export default AptitudePage
