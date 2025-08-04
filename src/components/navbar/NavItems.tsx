'use client'

import { cn } from '@/lib/utils';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

const navItems = [
  {label: "Home", href:"/"},
  // {label: "About", href:"/"},
]
const NavItems = () => {
  const pathName = usePathname();
  return (
    <div className='flex gap-4'>
      {navItems.map(({label, href}) => (
        <Link href={href} key={label} className={cn(pathName === href && 'font-semibold')}>{label}</Link>
      ))}
    </div>
  )
}

export default NavItems