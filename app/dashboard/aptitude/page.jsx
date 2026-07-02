import React from 'react'
import AddAptitudeTest from './_components/AddAptitudeTest'
import AptitudeList from './_components/AptitudeList'

const AptitudePage = () => {
  return (
    <div className='px-6 md:px-0 py-8'>
        <div className="max-w-7xl mx-auto">
          <h2 className='font-bold text-4xl md:text-5xl mb-2 text-foreground'>Aptitude Tests</h2>
          <p className='text-lg text-gray-600 dark:text-gray-100 mb-8'>Generate custom topic-based multiple choice tests to sharpen your skills.</p>
          
          <div className='grid grid-cols-1 md:grid-cols-3 mb-12'>
              <AddAptitudeTest />
          </div>
          
          <AptitudeList />
        </div>
    </div>
  )
}

export default AptitudePage
