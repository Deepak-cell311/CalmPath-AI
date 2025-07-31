"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ArrowLeft, Gift, Mail } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const router = useRouter() // Initialize useRouter
  
  // Regular login state
  const [userType, setUserType] = useState<"Patient" | "Family Member" | "Facility Staff" | "">("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invite login state
  const [inviteUserType, setInviteUserType] = useState<"Patient" | "Family Member" | "Facility Staff" | "">("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteCodeOnly, setInviteCodeOnly] = useState("")
  const [isInviteLoading, setIsInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

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

  const handleInviteLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviteLoading(true)
    setInviteError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/invite-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: inviteEmail,
          inviteCode: inviteCodeOnly.trim(),
          accountType: inviteUserType
        }),
      });

      const result = await response.json();
      console.log("Invite Login Result: ", result);

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
        setInviteError(result.error || "Invite login failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Invite login error:", err)
      const message = err.response?.data?.error || err.message || "Something went wrong. Try again."
      setInviteError(message)
    } finally {
      setIsInviteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">CalmPath AI</h1>
          </div>
          <p className="text-gray-600">Welcome back to your care journey</p>
        </div>

        <Tabs defaultValue="regular" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="regular">Regular Login</TabsTrigger>
            <TabsTrigger value="invite">Invite Login</TabsTrigger>
          </TabsList>

          <TabsContent value="regular">
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
                      name="inviteCode"
                      placeholder="Enter invite code if you have one"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      If you have an invite code, enter it here to get free access to the facility.
                    </p>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle>Invite Login</CardTitle>
                <CardDescription>Login with your invite code (no password required)</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteUserType">Account Type</Label>
                    <Select value={inviteUserType} onValueChange={(value: any) => setInviteUserType(value)}>
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
                    <Label htmlFor="inviteEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="inviteEmail"
                      name="inviteEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inviteCodeOnly" className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Invite Code
                    </Label>
                    <Input
                      id="inviteCodeOnly"
                      name="inviteCodeOnly"
                      placeholder="Enter your invite code"
                      value={inviteCodeOnly}
                      onChange={(e) => setInviteCodeOnly(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      You must have an account first. If you don't have one, please sign up first.
                    </p>
                  </div>

                  {inviteError && (
                    <div className="text-red-500 text-sm">{inviteError}</div>
                  )}

                  <Button type="submit" className="w-full" disabled={isInviteLoading}>
                    {isInviteLoading ? "Signing in..." : "Sign In with Invite"}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
                      Sign up first
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}