"use client"

import type React from "react"

console.log("Rendering new tour page")

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function NewTourPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    tour_name: "",
    description: "",
    region: "",
    duration_days: "",
    base_price: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    console.log("Form submitted", formData)

    try {
      const numericDuration = Number.parseInt(formData.duration_days)
      const numericPrice = Number.parseFloat(formData.base_price)

      if (isNaN(numericDuration) || numericDuration <= 0) {
        throw new Error("Duration must be a positive number")
      }

      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error("Base price must be a positive number")
      }

      const { data, error } = await supabase
        .from("tours")
        .insert({
          tour_name: formData.tour_name,
          description: formData.description || null,
          region: formData.region || null,
          duration_days: numericDuration,
          base_price: numericPrice,
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Tour created successfully",
        description: `The tour "${formData.tour_name}" has been added.`,
      })

      router.push("/dashboard/tours")
    } catch (error: any) {
      toast({
        title: "Error creating tour",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Tour</h2>
          <p className="text-muted-foreground">Create a new tour package</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Tour Details</CardTitle>
            <CardDescription>Enter the information for the new tour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tour_name">Tour Name *</Label>
              <Input
                id="tour_name"
                name="tour_name"
                required
                value={formData.tour_name}
                onChange={handleChange}
                placeholder="e.g., Mountain Trek Adventure"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of the tour"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g., Alpine Mountains"
              />
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
                  placeholder="e.g., 5"
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
                  placeholder="e.g., 499.99"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault()
                console.log("Cancel clicked")
                router.push("/dashboard/tours")
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Tour"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
