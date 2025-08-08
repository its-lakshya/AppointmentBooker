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
import { User } from "@/types/db";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User; // or just role?: "admin" | "staff" if you prefer
}

const data = {
  navMain: [
    {
      title: "Appointments",
      items: [
        {
          role: 'staff',
          title: "My Bookings",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/my-bookings`,
        },
        {
          role: 'admin',
          title: "Bookings",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/booking`,
        },
      ],
    },
    {
      title: "Setup",
      items: [
        {
          role: 'admin',
          title: "Services",
          url: `/dashboard/services`,
        },
        {
          role: 'admin',
          title: "Add-ons",
          url: `/dashboard/add-ons`,
        },
        {
          role: 'admin',
          title: "Booking Links",
          url: `/dashboard/booking-links`,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          role: 'admin',
          title: "Staff",
          url: `/dashboard/staff`,
        },
      ],
    },
    {
      title: "Customization",
      items: [
        {
          role: 'admin',
          title: "Branding",
          url: `/dashboard/branding`,
        },
      ],
    },
  ],
}

const AppSidebar = ({ user, ...props }: AppSidebarProps) => {
  const pathname = usePathname();
  const role = user?.role
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <LogoFull />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((section) => {
          const visibleItems = section.items.filter((item) => item.role === role);
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.url === pathname}>
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar