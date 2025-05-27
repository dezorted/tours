"use client"

import { LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "./sidebar"
import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function getUserEmail() {
      const supabase = createSupabaseClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserEmail(data.user.email)
      }
    }

    getUserEmail()
  }, [])

  const handleSignOut = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <DashboardSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold">Tours Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          {userEmail && <span className="hidden md:inline-block text-sm text-muted-foreground">{userEmail}</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
