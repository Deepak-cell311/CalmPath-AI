"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ArrowLeft, Gift, Mail, Users, User, Shield, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const router = useRouter() // Initialize useRouter
  const { login, inviteLogin } = useAuth()

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

  // Family member login options state
  const [showFamilyOptions, setShowFamilyOptions] = useState(false)
  const [familyLoginData, setFamilyLoginData] = useState<{ email: string, password: string, inviteCode?: string } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password, userType, inviteCode.trim() || undefined)

      // If family member logs in, show options
      if (userType === "Family Member") {
        setFamilyLoginData({ email, password, inviteCode: inviteCode.trim() || undefined })
        setShowFamilyOptions(true)
        setIsLoading(false)
        return
      }

      // Navigate based on account type
      if (userType === "Facility Staff") {
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFamilyMemberLogin = async (loginAs: "family" | "patient") => {
    if (!familyLoginData) return

    setIsLoading(true)
    setError(null)

    try {
      if (loginAs === "family") {
        // Login as family member - go to family dashboard
        await login(familyLoginData.email, familyLoginData.password, "Family Member", familyLoginData.inviteCode)
        router.push("/family-dashboard")
      } else {
        // Login as patient - go to main page
        await login(familyLoginData.email, familyLoginData.password, "Patient", familyLoginData.inviteCode)
        router.push("/main")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
      setShowFamilyOptions(false)
      setFamilyLoginData(null)
    }
  }

  const handleInviteLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviteLoading(true)
    setInviteError(null)

    try {
      await inviteLogin(inviteEmail, inviteCodeOnly.trim(), inviteUserType)

      // If family member logs in via invite, show options
      if (inviteUserType === "Family Member") {
        setFamilyLoginData({ email: inviteEmail, password: "", inviteCode: inviteCodeOnly.trim() })
        setShowFamilyOptions(true)
        setIsInviteLoading(false)
        return
      }

      // Navigate based on account type
      if (inviteUserType === "Facility Staff") {
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Invite login error:", err)
      setInviteError(err.message || "Invite login failed. Please try again.")
    } finally {
      setIsInviteLoading(false)
    }
  }

  // Family member login options view
  if (showFamilyOptions) {
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
            <p className="text-slate-600 text-lg">Choose your access mode</p>
            <p className="text-slate-500 text-sm mt-1">Select how you'd like to use the platform today</p>
          </div>
          <div className="space-y-4 mb-6">
             {/* Family Member Access */}
            <Card className="border-2 border-transparent hover:border-blue-200 transition-all duration-200 hover:shadow-lg group cursor-pointer">
              <CardContent className="p-6">
                <Button
                  onClick={() => handleFamilyMemberLogin("family")}
                  className="w-full h-auto p-0 bg-transparent hover:bg-transparent text-left group-hover:scale-[1.02] transition-transform"
                  disabled={isLoading}
                  variant="ghost"
                >
                  <div className="flex items-start space-x-4 w-full">
                    <div className="bg-blue-100 rounded-xl p-3 group-hover:bg-blue-200 transition-colors">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Family Member</h3>
                      <p className="text-slate-600 text-sm mb-2">Comprehensive care management</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                          Photo Management
                        </span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                          Medications
                        </span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                          Care Coordination
                        </span>
                      </div>
                    </div>
                    <Shield className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Patient Access */}
          <Card className="border-2 border-transparent hover:border-emerald-200 transition-all duration-200 hover:shadow-lg group cursor-pointer">
            <CardContent className="p-6">
              <Button
                onClick={() => handleFamilyMemberLogin("main")}
                className="w-full h-auto p-0 bg-transparent hover:bg-transparent text-left group-hover:scale-[1.02] transition-transform"
                disabled={isLoading}
                variant="ghost"
              >
                <div className="flex items-start space-x-4 w-full">
                  <div className="bg-emerald-100 rounded-xl p-3 group-hover:bg-emerald-200 transition-colors">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Patient</h3>
                    <p className="text-slate-600 text-sm mb-2">Personal AI companion experience</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium">
                        Voice Chat
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium">
                        AI Companion
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium">
                        Personal Support
                      </span>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    )
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
                      Sign up
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