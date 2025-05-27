"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage(null)
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log("Attempting login with:", formData.email)
      const supabase = createSupabaseClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error("Login error:", error)

        // Convert error codes to user-friendly messages
        if (error.message === "Invalid login credentials") {
          throw new Error("The email or password you entered is incorrect. Please try again.")
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Please check your email to confirm your account before logging in.")
        } else {
          throw new Error("There was a problem signing in. Please try again.")
        }
      }

      console.log("Login successful:", data)

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Login error details:", error)

      // Set a user-friendly error message
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestAccount = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const email = `test${Math.floor(Math.random() * 10000)}@example.com`
      const password = "Password123!"
      console.log("Creating test account with:", email)

      const supabase = createSupabaseClient()

      // Sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "admin",
          },
        },
      })

      if (signUpError) {
        console.error("Test account creation error:", signUpError)
        throw new Error("Could not create test account. Please try again.")
      }

      console.log("Test account created:", signUpData)

      // Sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("Test account login error:", signInError)
        throw new Error("Test account created but could not log in automatically.")
      }

      console.log("Test account login successful:", signInData)

      toast({
        title: "Test account created and logged in",
        description: `Email: ${email}, Password: ${password}`,
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Test account error details:", error)
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your admin account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="text-sm">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
