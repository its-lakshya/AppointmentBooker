"use client"
import { GalleryVerticalEnd } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import LogoMark from "./LogoMark"

const LogoFull = () => {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <LogoMark />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-2xl">Bookly</span>
              </div>
            </SidebarMenuButton>
       
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default LogoFull;
