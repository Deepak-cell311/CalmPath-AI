"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CreditCard, DollarSign, Download, Bell, Building } from "lucide-react"

export default function SettingsPage() {
  const [facilityInfo, setFacilityInfo] = useState({
    name: "Sunset Memory Care",
    address: "123 Care Lane, Springfield, IL 62701",
    phone: "(555) 123-4567",
    email: "admin@sunsetmemorycare.com",
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyReports: true,
    systemUpdates: true,
  })

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your facility settings and preferences</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs defaultValue="facility" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="facility">Facility Info</TabsTrigger>
            <TabsTrigger value="billing">Billing & Subscription</TabsTrigger>
            <TabsTrigger value="payouts">Commission Payouts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Facility Information */}
          <TabsContent value="facility">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Facility Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facilityName">Facility Name</Label>
                    <Input
                      id="facilityName"
                      value={facilityInfo.name}
                      onChange={(e) => setFacilityInfo({ ...facilityInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={facilityInfo.phone}
                      onChange={(e) => setFacilityInfo({ ...facilityInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={facilityInfo.address}
                    onChange={(e) => setFacilityInfo({ ...facilityInfo, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={facilityInfo.email}
                    onChange={(e) => setFacilityInfo({ ...facilityInfo, email: e.target.value })}
                  />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing & Subscription */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Professional Plan</h3>
                      <p className="text-gray-600">Up to 50 patients</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Cost</p>
                      <p className="text-2xl font-bold">$299</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Billing</p>
                      <p className="font-medium">January 15, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Patients</p>
                      <p className="font-medium">12 / 50</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline">Cancel Subscription</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/26</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "Dec 15, 2024", amount: "$299.00", status: "Paid" },
                      { date: "Nov 15, 2024", amount: "$299.00", status: "Paid" },
                      { date: "Oct 15, 2024", amount: "$299.00", status: "Paid" },
                    ].map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{invoice.date}</p>
                          <p className="text-sm text-gray-600">Monthly subscription</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{invoice.amount}</span>
                          <Badge variant="secondary">{invoice.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Commission Payouts */}
          <TabsContent value="payouts">
            <div className="space-y-6">
              {/* Payout Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Commission Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">This Month</p>
                      <p className="text-3xl font-bold text-green-600">$1,247</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                      <p className="text-3xl font-bold">$8,932</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Next Payout</p>
                      <p className="text-lg font-medium">Jan 1, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payout Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Bank Account</Label>
                    <Input id="bankAccount" placeholder="•••• •••• •••• 1234" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input id="routingNumber" placeholder="••••••••" disabled />
                  </div>
                  <Button variant="outline">Update Banking Info</Button>
                </CardContent>
              </Card>

              {/* Payout History */}
              <Card>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "Dec 1, 2024", amount: "$1,156.00", status: "Completed" },
                      { date: "Nov 1, 2024", amount: "$987.50", status: "Completed" },
                      { date: "Oct 1, 2024", amount: "$1,234.75", status: "Completed" },
                    ].map((payout, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{payout.date}</p>
                          <p className="text-sm text-gray-600">Monthly commission</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{payout.amount}</span>
                          <Badge variant="secondary">{payout.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Alerts</h3>
                    <p className="text-sm text-gray-600">Receive important notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Alerts</h3>
                    <p className="text-sm text-gray-600">Receive urgent notifications via text message</p>
                  </div>
                  <Switch
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly Reports</h3>
                    <p className="text-sm text-gray-600">Get weekly summary reports</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">System Updates</h3>
                    <p className="text-sm text-gray-600">Notifications about system updates and maintenance</p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                  />
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
