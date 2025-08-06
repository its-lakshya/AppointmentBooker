"use client";

import { ReactNode } from 'react';

import AppSidebar from '@/components/dashboard/AppSidebar';
import { NavbarBreadcrumbs } from '@/components/dashboard/NavbarBreadcrumbs';
import LogoMark from '@/components/logo/LogoMark';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { SignedIn, SignedOut, SignUpButton, UserButton } from '@clerk/clerk-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 justify-between items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <ShowLogo />
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <NavbarBreadcrumbs />
          </div>
          <SignedOut>
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ShowLogo() {
  const { state } = useSidebar();
  return state === "collapsed" ? <LogoMark /> : null;
}
