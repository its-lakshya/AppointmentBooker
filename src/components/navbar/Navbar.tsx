import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import NavItems from './NavItems'
import Logo from './Logo'

const Navbar = () => {
  return (
    <nav className='flex justify-between items-center'>
      <Logo />
      <div className='flex items-center gap-4'>
        <NavItems />
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedOut>
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  )
}

export default Navbar