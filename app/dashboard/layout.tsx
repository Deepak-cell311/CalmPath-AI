"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { BarChart3, Users, Settings, User, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  const menuItems = [
    { title: "Dashboard", icon: BarChart3, href: "/dashboard" },
    { title: "Patient Management", icon: Users, href: "/dashboard/patients" },
    { title: "Settings", icon: Settings, href: "/dashboard/settings" },
  ]

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  // console.log("User data: ", user)

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">CalmPathAI</h2>
            <p className="text-sm text-gray-600">Memory Care Monitor</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <a href={item.href} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.firstName + " " + user?.lastName || "Staff"}</p>
            <p className="text-xs text-gray-600">{user?.accountType || "Staff"}</p>
          </div>
          <button onClick={handleLogout} className="hover:bg-gray-200 p-1 rounded">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
