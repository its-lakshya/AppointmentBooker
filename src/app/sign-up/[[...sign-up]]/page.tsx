import React from 'react'
import { SignUp } from '@clerk/nextjs'

const SignUpPage = () => {
  return (
    <main className='px-4 py-8 flex justify-center items-center'>
      <SignUp />
    </main>
  )
}

export default SignUpPage;