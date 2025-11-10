"use client"

import * as React from "react"
import { BookUser, HomeIcon, HammerIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Home",
      url: "/",
      icon: HomeIcon,
      isActive: false,
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: BookUser,
      isActive: true,
      items: [
        {
          title: "Contacts List",
          url: "/contacts",
        },
        {
          title: "Add Contact",
          url: "/contacts/new",
        },
      ],
    },
    {
      title: "Objects",
      url: "/objects",
      icon: HammerIcon,
      isActive: true,
      items: [
        {
          title: "Objects List",
          url: "/objects",
        },
        {
          title: "Add Object",
          url: "/objects/new",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarTrigger className="absolute -right-10 top-3 z-50 bg-background border border-border rounded-md shadow hover:bg-muted transition" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />{" "}
    </Sidebar>
  )
}
