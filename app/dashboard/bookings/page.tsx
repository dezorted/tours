"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient } from "@/lib/supabase"
import type { BookingWithDetails } from "@/lib/types"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = bookings.filter(
        (booking) =>
          booking.customer?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.customer?.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.tour?.tour_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.status.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredBookings(filtered)
    } else {
      setFilteredBookings(bookings)
    }
  }, [searchQuery, bookings])

  async function fetchBookings() {
    setIsLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          customer:customer_id(customer_id, first_name, last_name, email),
          tour:tour_id(tour_id, tour_name)
        `,
        )
        .order("booking_date", { ascending: false })

      if (error) {
        throw error
      }

      setBookings(data as BookingWithDetails[])
      setFilteredBookings(data as BookingWithDetails[])
    } catch (error: any) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString()
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500 hover:bg-green-600"
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "cancelled":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
        <p className="text-muted-foreground">View tour bookings</p>
      </div>

      <div className="flex items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bookings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Travel Date</TableHead>
                <TableHead>Travelers</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No bookings found. {searchQuery && "Try adjusting your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell className="font-medium">
                      {booking.customer?.first_name} {booking.customer?.last_name}
                    </TableCell>
                    <TableCell>{booking.tour?.tour_name}</TableCell>
                    <TableCell>{formatDate(booking.travel_date)}</TableCell>
                    <TableCell>{booking.number_of_travelers}</TableCell>
                    <TableCell>${booking.total_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
