import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import LogoFull from "../logo/LogoFull"
import { usePathname } from "next/navigation";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Appointments",
      items: [
        {
          title: "Bookings",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/booking`,
        },
      ],
    },
    {
      title: "Setup",
      items: [
        {
          title: "Services",
          url: `/dashboard/services`,
        },
        {
          title: "Add-ons",
          url: `/dashboard/add-ons`,
          isActive: true,
        },
        {
          title: "Booking Links",
          url: `/dashboard/booking-links`,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Staff",
          url: `/dashboard/staff`,
        },
      ],
    },
    {
      title: "Customization",
      items: [
        {
          title: "Branding",
          url: `/dashboard/branding`,
        },
      ],
    },
  ],
}

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const pathname = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader >
        <LogoFull/>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.url === pathname}>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar