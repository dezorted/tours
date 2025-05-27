"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Home, Map, Users, Calendar, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ElementType
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </a>
        )
      })}
    </nav>
  )
}

export function DashboardSidebar() {
  const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Tours",
      href: "/dashboard/tours",
      icon: Map,
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: Users,
    },
    {
      title: "Bookings",
      href: "/dashboard/bookings",
      icon: Calendar,
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
  ]

  return (
    <div className="hidden border-r bg-background lg:block w-64">
      <div className="flex flex-col h-full px-3 py-4">
        <div className="flex-1 my-4">
          <SidebarNav items={sidebarNavItems} />
        </div>
      </div>
    </div>
  )
}
