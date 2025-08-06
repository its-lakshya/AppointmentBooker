import React from 'react'
import { SignIn } from '@clerk/nextjs'

const SignInPage = () => {
  return (
    <main className='h-screen px-4 py-8 flex justify-center items-center'>
      <SignIn />
    </main>
  )
}

export default SignInPage;