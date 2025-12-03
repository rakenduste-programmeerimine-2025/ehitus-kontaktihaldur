"use client"

import { BookUser, HomeIcon, HammerIcon, UsersIcon } from "lucide-react"
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
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { TeamSwitcher } from "@/components/teams/team-switch"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarTrigger className="absolute -right-10 top-3 z-50 bg-background border border-border rounded-md shadow hover:bg-muted transition" />
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={[
            { title: "Home", url: "/", icon: HomeIcon },
            { title: "Teams", url: "/teams", icon: UsersIcon },
            {
              title: "Contacts",
              url: "/contacts",
              icon: BookUser,
              items: [
                { title: "Contacts List", url: "/contacts" },
                { title: "Add Contact", url: "/contacts/new" },
              ],
            },
            {
              title: "Objects",
              url: "/objects",
              icon: HammerIcon,
              items: [
                { title: "Objects List", url: "/objects" },
                { title: "Add Object", url: "/objects/add" },
              ],
            },
          ]}
        />
      </SidebarContent>

      {!loading && user && (
        <SidebarFooter>
          <NavUser
            user={{
              name: `${user.user_metadata?.first_name || ""} ${
                user.user_metadata?.last_name || ""
              }`.trim(),
              email: user.email ?? "",
              avatar: user.user_metadata?.avatar_url || null,
            }}
          />
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  )
}
