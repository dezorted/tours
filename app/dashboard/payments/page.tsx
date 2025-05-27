"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient } from "@/lib/supabase"
import type { PaymentWithBooking } from "@/lib/types"
import { Search } from "lucide-react"

export default function PaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<PaymentWithBooking[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = payments.filter(
        (payment) =>
          payment.booking?.customer?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.booking?.customer?.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (payment.transaction_id && payment.transaction_id.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredPayments(filtered)
    } else {
      setFilteredPayments(payments)
    }
  }, [searchQuery, payments])

  async function fetchPayments() {
    setIsLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          booking:booking_id(
            booking_id, 
            customer:customer_id(customer_id, first_name, last_name),
            tour:tour_id(tour_id, tour_name)
          )
        `,
        )
        .order("payment_date", { ascending: false })

      if (error) {
        throw error
      }

      setPayments(data as PaymentWithBooking[])
      setFilteredPayments(data as PaymentWithBooking[])
    } catch (error: any) {
      toast({
        title: "Error fetching payments",
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">View payment records</p>
      </div>

      <div className="flex items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search payments..."
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
                <TableHead>Payment Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No payments found. {searchQuery && "Try adjusting your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.payment_id}>
                    <TableCell className="font-medium">
                      {payment.booking?.customer?.first_name} {payment.booking?.customer?.last_name}
                    </TableCell>
                    <TableCell>{payment.booking?.tour?.tour_name}</TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>${payment.amount_paid.toFixed(2)}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{payment.transaction_id || "N/A"}</TableCell>
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
