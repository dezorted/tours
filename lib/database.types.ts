export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tours: {
        Row: {
          tour_id: string
          tour_name: string
          description: string | null
          region: string | null
          duration_days: number
          base_price: number
        }
        Insert: {
          tour_id?: string
          tour_name: string
          description?: string | null
          region?: string | null
          duration_days: number
          base_price: number
        }
        Update: {
          tour_id?: string
          tour_name?: string
          description?: string | null
          region?: string | null
          duration_days?: number
          base_price?: number
        }
      }
      customers: {
        Row: {
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
      }
      bookings: {
        Row: {
          booking_id: string
          customer_id: string
          tour_id: string
          booking_date: string
          travel_date: string
          number_of_travelers: number
          total_price: number
          status: string
        }
      }
      payments: {
        Row: {
          payment_id: string
          booking_id: string
          payment_date: string
          amount_paid: number
          payment_method: string
          transaction_id: string | null
        }
      }
    }
  }
}
