"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Tour } from "@/lib/types"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function EditTourPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Tour>>({
    tour_name: "",
    description: "",
    region: "",
    duration_days: undefined,
    base_price: undefined,
  })

  useEffect(() => {
    async function fetchTour() {
      try {
        const { data, error } = await supabase.from("tours").select("*").eq("tour_id", params.id).single()

        if (error) {
          throw error
        }

        setFormData({
          ...data,
          duration_days: data.duration_days.toString(),
          base_price: data.base_price.toString(),
        })
      } catch (error: any) {
        toast({
          title: "Error fetching tour",
          description: error.message,
          variant: "destructive",
        })
        router.push("/dashboard/tours")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTour()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const numericDuration = Number.parseInt(formData.duration_days as string)
      const numericPrice = Number.parseFloat(formData.base_price as string)

      if (isNaN(numericDuration) || numericDuration <= 0) {
        throw new Error("Duration must be a positive number")
      }

      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error("Base price must be a positive number")
      }

      const { error } = await supabase
        .from("tours")
        .update({
          tour_name: formData.tour_name,
          description: formData.description || null,
          region: formData.region || null,
          duration_days: numericDuration,
          base_price: numericPrice,
        })
        .eq("tour_id", params.id)

      if (error) {
        throw error
      }

      toast({
        title: "Tour updated successfully",
        description: `The tour "${formData.tour_name}" has been updated.`,
      })

      router.push("/dashboard/tours")
    } catch (error: any) {
      toast({
        title: "Error updating tour",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tour details...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Tour</h2>
          <p className="text-muted-foreground">Update tour details</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Tour Details</CardTitle>
            <CardDescription>Edit the information for this tour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tour_name">Tour Name *</Label>
              <Input id="tour_name" name="tour_name" required value={formData.tour_name} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" name="region" value={formData.region || ""} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration_days">Duration (Days) *</Label>
                <Input
                  id="duration_days"
                  name="duration_days"
                  type="number"
                  min="1"
                  required
                  value={formData.duration_days}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price ($) *</Label>
                <Input
                  id="base_price"
                  name="base_price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={formData.base_price}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/tours")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Tour"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
