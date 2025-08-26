import { Link } from '@tanstack/react-router'
import React from 'react'

const Footer = () => {
  return (
    <div className="text-center mt-12">
    <div className="text-sm opacity-60">
        <a href='https://github.com/gopal-nd' className='hover:underline ' >
        <p className='text-blue-500'>Developed by @Gopal N D</p>
        </a>
      <p className="mt-1">Powered by NASA Open APIs and Supabase</p>
    </div>
  </div>
  )
}

export default Footer