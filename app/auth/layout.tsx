import type React from "react"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-screen bg-muted/40">{children}</div>
}
