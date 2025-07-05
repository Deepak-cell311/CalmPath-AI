"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, BarChart3 } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border">
      <div className="flex items-center gap-2">
        <Button asChild variant={pathname === "/" ? "default" : "ghost"} size="sm" className="rounded-full">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Patient
          </Link>
        </Button>
        <Button
          asChild
          variant={pathname.startsWith("/dashboard") ? "default" : "ghost"}
          size="sm"
          className="rounded-full"
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </nav>
  )
}
