import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Bell, Camera, Shield } from "lucide-react"
import Link from "next/link"

export default function CalmPathLanding() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Header */}
            <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl font-semibold text-blue-900">CalmPath</span>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/auth/login">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-3 sm:px-4 py-2 text-sm sm:text-base"
                            >
                                Log in
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg shadow-sm"
                            >
                                Sign up
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-4 sm:mb-6 leading-tight px-2">
                        Your Companion in Calm —<br className="hidden sm:block" />
                        <span className="sm:hidden"> </span>24/7 Voice Support for
                        <br className="hidden sm:block" />
                        <span className="sm:hidden"> </span>Older Adults
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                        Engage your loved one in calming conversations during moments of confusion or anxiety
                    </p>
                </div>

                {/* Phone Mockup Section */}
                <div className="flex justify-center mb-10 sm:mb-16">
                    <div className="relative">
                        <div className="w-64 h-80 sm:w-80 sm:h-96 bg-blue-900 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl">
                            <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-40 sm:max-w-48">
                                    <p className="text-blue-900 font-medium text-center text-sm sm:text-base">
                                        Hello! I'm here
                                        <br />
                                        to talk with you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                    <Card className="p-4 sm:p-6 border-0 shadow-sm bg-white">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                                    Gentle voice assistant that talks with the user
                                </h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 sm:p-6 border-0 shadow-sm bg-white">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                                    Medication reminders with caregiver notifications
                                </h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 sm:p-6 border-0 shadow-sm bg-white sm:col-span-2 lg:col-span-1">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                                    Upload personal photos for reminiscence therapy
                                </h3>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* CTA Section */}
                <div className="text-center mb-6 sm:mb-8 px-4">
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg w-full sm:w-auto min-h-[48px]"
                    >
                        <span className="block sm:hidden">
                            Start 14-day free trial
                            <br />
                            $29/month, cancel anytime
                        </span>
                        <span className="hidden sm:block">Start 14-day free trial • $29/month, cancel anytime</span>
                    </Button>
                </div>

                {/* Disclaimer */}
                <div className="text-center text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 px-4">
                    This product is not intended to diagnose, treat, cure, or prevent disease.
                </div>

                {/* Footer */}
                <footer className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-gray-200 text-xs sm:text-sm text-gray-600 gap-4 sm:gap-0">
                    <div>CalmPath, LLC</div>
                    <div className="flex gap-4 sm:gap-6">
                        <a href="#" className="hover:text-blue-600 transition-colors touch-target">
                            Contact us
                        </a>
                        <a href="#" className="hover:text-blue-600 transition-colors touch-target">
                            FAQ
                        </a>
                    </div>
                </footer>
            </main>
        </div>
    )
}
