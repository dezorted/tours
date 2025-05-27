"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define the site URL as a constant to ensure consistency
const SITE_URL = "https://tours.dezorted.com"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [registrationStatus, setRegistrationStatus] = useState<"idle" | "success" | "error">("idle")
  const [registeredEmail, setRegisteredEmail] = useState<string>("")

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
    setRegistrationStatus("idle")

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please make sure your passwords match.")
      setIsLoading(false)
      return
    }

    try {
      console.log("Attempting registration with:", formData.email)
      const supabase = createSupabaseClient()

      // Update the redirect URL to tours.dezorted.com
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: "admin",
          },
          emailRedirectTo: `${SITE_URL}/auth/callback`,
        },
      })

      if (error) {
        console.error("Registration error:", error)

        // Handle specific error cases with user-friendly messages
        if (error.message.includes("already registered")) {
          throw new Error("This email is already registered. Please try logging in instead.")
        } else if (error.message.includes("password")) {
          throw new Error("Password is too weak. Please use a stronger password.")
        } else if (error.message.includes("invalid")) {
          throw new Error("Please enter a valid email address that you have access to.")
        } else {
          throw new Error("There was a problem creating your account. Please try again.")
        }
      }

      console.log("Registration response:", data)

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        toast({
          title: "Email already registered",
          description: "This email is already registered. Please try logging in instead.",
        })
        router.push("/auth/login")
        return
      }

      // Store the registered email for display
      setRegisteredEmail(formData.email)
      setRegistrationStatus("success")

      // Clear the form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      })

      // Don't redirect automatically - let the user see the confirmation message
    } catch (error: any) {
      console.error("Registration error details:", error)
      setErrorMessage(error.message)
      setRegistrationStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!registeredEmail) return

    setIsLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: registeredEmail,
        options: {
          // Update the redirect URL for resend as well
          emailRedirectTo: `${SITE_URL}/auth/callback`,
        },
      })

      if (error) throw error

      toast({
        title: "Confirmation email resent",
        description: "Please check your inbox and spam folder.",
      })
    } catch (error: any) {
      console.error("Error resending email:", error)
      toast({
        title: "Error resending email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If registration was successful, show confirmation screen
  if (registrationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent a confirmation email to <strong>{registeredEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <p>
                  You need to verify your email address before you can sign in. Please check your inbox and spam folder.
                </p>
              </AlertDescription>
            </Alert>
            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the email? Check your spam folder or</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={handleResendEmail} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Resend confirmation email
            </Button>
            <div className="text-center">
              <Link href="/auth/login" className="text-primary hover:underline text-sm">
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details to create an admin account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
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
              <p className="text-xs text-muted-foreground">
                You'll need to verify this email address. Make sure you have access to it.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
