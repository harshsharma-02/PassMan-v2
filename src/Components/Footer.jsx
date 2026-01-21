import React from 'react'

const Footer = () => {
  return (
    <div className='w-full bg-purple-400 flex flex-col justify-center items-center p-0.5 mt-auto'>
        <div className="logo font-bold text-2xl">
          <span>Pass</span>
          <span className="text-violet-800">Man</span>
          <span className="text-purple-900">
            <lord-icon
              src="https://cdn.lordicon.com/srupsmbe.json"
              trigger="in"
              delay="800"
              state="pinch"
              colors="primary:#000000,secondary:#ffffff"
            ></lord-icon>
          </span>
        </div>

    <div className='flex font-medium'>
        Created with security by Harsh Sharma
    </div>
    </div>
  )
}

export default Footer