"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ArrowLeft, Gift } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter() // Initialize useRouter
  const [userType, setUserType] = useState<"Patient" | "Family Member" | "Facility Staff" | "">("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Make sure this is uncommented if your backend uses cookies
        body: JSON.stringify({
          email, 
          password, 
          accountType: userType,
          inviteCode: inviteCode.trim() || undefined // Only send if not empty
        }),
      });

      const result = await response.json();
      console.log("Result: ", result);

      if (response.ok && result.success) {
        const { user } = result

        // Use router.push for navigation
        if (user.accountType === "Patient") {
          router.push("/family-dashboard")
        } else if (user.accountType === "Family Member") {
          router.push("/family-dashboard")
        } else if (user.accountType === "Facility Staff") {
          router.push("/dashboard")
        }
      } else {
        setError(result.message || "Login failed. Please try again.") // Display specific error from backend
      }
    } catch (err: any) {
      console.error("Login error:", err)
      // Check if err has a response object with data and error message
      const message = err.response?.data?.error || err.message || "Something went wrong. Try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to CalmPath
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">CalmPath</h1>
          </div>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Choose your account type and sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userType">Account Type</Label>
                <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="Family Member">Family Member</SelectItem>
                    <SelectItem value="Facility Staff">Facility Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteCode" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Invite Code (Optional)
                </Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter invite code if you have one"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  If you have an invite code, enter it here to get free access to the facility.
                </p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>} {/* Display error message */}

              <Button type="submit" className="w-full" disabled={isLoading || !userType}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}