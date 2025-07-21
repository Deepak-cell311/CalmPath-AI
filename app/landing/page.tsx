"use client"

import { Button } from "@/components/ui/button"
import { Heart, Shield, Users, Stethoscope } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white shadow-sm">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Heart className="h-6 w-6 text-purple-600" />
          <span className="ml-2 text-xl font-semibold text-gray-800">CalmPath</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/auth/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-purple-100 to-blue-100">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-800">
                    A Compassionate Voice for Dementia Care
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    CalmPath is an AI-powered voice companion designed to provide comfort, engagement, and a sense of
                    connection for individuals with dementia.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-purple-600 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-700 disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    View Demo
                  </Link>
                </div>
              </div>
              <img
                src="/placeholder.svg"
                width="600"
                height="600"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-700">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-800">
                  Designed for Peace of Mind
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  CalmPath offers a suite of features to support both individuals with dementia and their caregivers.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <Heart className="h-10 w-10 mx-auto text-purple-600" />
                <h3 className="text-xl font-bold">Comforting Companion</h3>
                <p className="text-sm text-gray-600">
                  A soothing voice provides companionship, plays music, and engages in gentle conversation.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Users className="h-10 w-10 mx-auto text-purple-600" />
                <h3 className="text-xl font-bold">Family Connection</h3>
                <p className="text-sm text-gray-600">
                  Families can upload photos and personal stories to create a rich, personalized experience.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Stethoscope className="h-10 w-10 mx-auto text-purple-600" />
                <h3 className="text-xl font-bold">Facility Integration</h3>
                <p className="text-sm text-gray-600">
                  Seamlessly integrates with care facilities to provide a holistic care solution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-gray-800">How CalmPath Works</h2>
              <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A simple and intuitive experience for everyone involved.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">1. Setup</h3>
                <p className="text-sm text-gray-600">Family or facility sets up the patient's profile.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">2. Interact</h3>
                <p className="text-sm text-gray-600">Patient interacts with the CalmPath voice assistant.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">3. Connect</h3>
                <p className="text-sm text-gray-600">Family and caregivers stay connected and informed.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500">&copy; 2024 CalmPath AI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
} 