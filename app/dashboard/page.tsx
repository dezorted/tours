"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createSupabaseClient } from "@/lib/supabase"
import { Users, Map, Calendar, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalTours: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalPayments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)
      try {
        const supabase = createSupabaseClient()

        // Fetch count of tours
        const { count: toursCount, error: toursError } = await supabase
          .from("tours")
          .select("*", { count: "exact", head: true })

        // Fetch count of customers
        const { count: customersCount, error: customersError } = await supabase
          .from("customers")
          .select("*", { count: "exact", head: true })

        // Fetch count of bookings
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })

        // Fetch count of payments
        const { count: paymentsCount, error: paymentsError } = await supabase
          .from("payments")
          .select("*", { count: "exact", head: true })

        setStats({
          totalTours: toursCount || 0,
          totalCustomers: customersCount || 0,
          totalBookings: bookingsCount || 0,
          totalPayments: paymentsCount || 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleAddNewTour = () => {
    router.push("/dashboard/tours/new")
  }

  const handleViewBookings = () => {
    router.push("/dashboard/bookings")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your tours and bookings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalTours}</div>
            <p className="text-xs text-muted-foreground">Available tour packages</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">Recorded payment transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="grid grid-cols-2 gap-2 max-w-md">
              <Button
                onClick={handleAddNewTour}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Add New Tour
              </Button>
              <Button
                onClick={handleViewBookings}
                className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                View Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
