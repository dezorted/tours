export type Tour = {
  tour_id: string
  tour_name: string
  description: string | null
  region: string | null
  duration_days: number
  base_price: number
}

export type Customer = {
  customer_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  street_address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
}

export type Booking = {
  booking_id: string
  customer_id: string
  tour_id: string
  booking_date: string
  travel_date: string
  number_of_travelers: number
  total_price: number
  status: "Confirmed" | "Pending" | "Cancelled"
}

export type Payment = {
  payment_id: string
  booking_id: string
  payment_date: string
  amount_paid: number
  payment_method: "Credit Card" | "Bank Transfer" | "Cash"
  transaction_id: string | null
}

// Extended types with related data
export type BookingWithDetails = Booking & {
  customer: Customer
  tour: Tour
}

export type PaymentWithBooking = Payment & {
  booking: BookingWithDetails
}
