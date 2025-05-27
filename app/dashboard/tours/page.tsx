"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient } from "@/lib/supabase"
import type { Tour } from "@/lib/types"
import { Plus, Search, MoreHorizontal, FileEdit, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ToursPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null)

  useEffect(() => {
    fetchTours()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = tours.filter(
        (tour) =>
          tour.tour_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tour.region && tour.region.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredTours(filtered)
    } else {
      setFilteredTours(tours)
    }
  }, [searchQuery, tours])

  async function fetchTours() {
    setIsLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.from("tours").select("*").order("tour_name")

      if (error) {
        throw error
      }

      setTours(data as Tour[])
      setFilteredTours(data as Tour[])
    } catch (error: any) {
      toast({
        title: "Error fetching tours",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteTour(tourId: string) {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from("tours").delete().eq("tour_id", tourId)

      if (error) {
        throw error
      }

      setTours(tours.filter((tour) => tour.tour_id !== tourId))
      toast({
        title: "Tour deleted",
        description: "The tour has been successfully removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error deleting tour",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleAddNewTour = () => {
    router.push("/dashboard/tours/new")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tours</h2>
          <p className="text-muted-foreground">Manage your tour packages</p>
        </div>
        <Button asChild>
          <a href="/dashboard/tours/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Tour
          </a>
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tours..."
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
                <TableHead>Tour Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Duration (Days)</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading tours...
                  </TableCell>
                </TableRow>
              ) : filteredTours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No tours found. {searchQuery && "Try adjusting your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTours.map((tour) => (
                  <TableRow key={tour.tour_id}>
                    <TableCell className="font-medium">{tour.tour_name}</TableCell>
                    <TableCell>{tour.region || "Not specified"}</TableCell>
                    <TableCell>{tour.duration_days}</TableCell>
                    <TableCell>${tour.base_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/tours/${tour.tour_id}`)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTourToDelete(tour)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={!!tourToDelete} onOpenChange={(open) => !open && setTourToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tour "{tourToDelete?.tour_name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (tourToDelete) {
                  deleteTour(tourToDelete.tour_id)
                  setTourToDelete(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
