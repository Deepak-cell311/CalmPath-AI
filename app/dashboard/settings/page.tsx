"use client"

import { useState, useEffect } from "react"
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
    name: "",
    address: "",
    phone: "",
    email: "",
    tagline: "",
    logoUrl: "",
    logoFile: null as File | null,
    logoPreview: null as string | null,
    brandColor: "#3B82F6",
  })
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyReports: true,
    systemUpdates: true,
  })
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facilityBilling, setFacilityBilling] = useState({
    monthlyPrice: "",      // e.g. "25"
    promoCode: "",         // e.g. "FREE2025"
    stripePriceId: "",     // Stripe price ID
  });
  const [billingSaveStatus, setBillingSaveStatus] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility`, {
      // credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setFacilityInfo({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.adminEmail || data.email || "",
          tagline: data.tagline || "",
          logoUrl: data.logoUrl || "",
          logoFile: null,
          logoPreview: null,
          brandColor: data.brandColor || "#3B82F6",
        })
      })
      .catch(() => setSaveStatus("Failed to load facility info"));

    // Load billing settings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/billing`, {
      // credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setFacilityBilling({
          monthlyPrice: data.monthlyPrice || "",
          promoCode: data.promoCode || "",
          stripePriceId: data.stripePriceId || "",
        })
      })
      .catch(() => setBillingSaveStatus("Failed to load billing settings"));
  }, [])

  const handleSave = async () => {
    setSaveStatus(null)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // credentials: "include",
      body: JSON.stringify(facilityInfo),
    })
    if (res.ok) {
      setSaveStatus("Saved!")
    } else {
      setSaveStatus("Failed to save")
    }
  }

  const handleSaveBilling = async () => {
    setBillingSaveStatus("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyPrice: facilityBilling.monthlyPrice,
          promoCode: facilityBilling.promoCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state with the response data
        setFacilityBilling({
          monthlyPrice: facilityBilling.monthlyPrice, // Keep the user's input
          promoCode: data.facility?.promoCode || "",
          stripePriceId: data.stripePriceId || "",
        });
        setBillingSaveStatus("Saved!");
        // Clear status after 3 seconds
        setTimeout(() => setBillingSaveStatus(""), 3000);
        
        // Refresh the billing data to show updated values
        setTimeout(() => {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/billing`)
            .then(res => res.json())
            .then(data => {
              setFacilityBilling({
                monthlyPrice: data.monthlyPrice || "",
                promoCode: data.promoCode || "",
                stripePriceId: data.stripePriceId || "",
              });
            })
            .catch(() => setBillingSaveStatus("Failed to refresh billing settings"));
        }, 1000);
      } else {
        const errorData = await res.json();
        setBillingSaveStatus(errorData.message || "Failed to save billing settings");
      }
    } catch (error) {
      console.error("Error saving billing settings:", error);
      setBillingSaveStatus("Failed to save billing settings");
    }
  }

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="facility">Facility Info</TabsTrigger>
            <TabsTrigger value="billing">Billing & Subscription</TabsTrigger>
            {/* <TabsTrigger value="payouts">Commission Payouts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
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

                <div className="space-y-2">
                  <Label htmlFor="tagline">Facility Tagline</Label>
                  <Input
                    id="tagline"
                    value={facilityInfo.tagline || ""}
                    onChange={(e) => setFacilityInfo({ ...facilityInfo, tagline: e.target.value })}
                    placeholder="e.g. Caring for the Community"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Facility Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Only set in UI state for now; handle upload in backend logic if/when needed
                        setFacilityInfo(prev => ({ ...prev, logoFile: file }));

                        // Optional: Local preview (does NOT affect backend)
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result;
                          setFacilityInfo(prev => ({
                            ...prev,
                            logoPreview: typeof result === 'string' ? result : null
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {facilityInfo.logoPreview && (
                    <div className="mt-2">
                      <img
                        src={facilityInfo.logoPreview}
                        alt="Logo Preview"
                        className="h-16 object-contain rounded border"
                      />
                    </div>
                  )}
                  {/* Existing logo display, if already uploaded */}
                  {!facilityInfo.logoPreview && facilityInfo.logoUrl && (
                    <div className="mt-2">
                      <img
                        src={facilityInfo.logoUrl}
                        alt="Facility Logo"
                        className="h-16 object-contain rounded border"
                      />
                    </div>
                  )}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="brandColor">Primary Brand Color</Label>
                  <Input
                    id="brandColor"
                    type="color"
                    value={facilityInfo.brandColor || "#2E90FA"}
                    onChange={(e) =>
                      setFacilityInfo({ ...facilityInfo, brandColor: e.target.value })
                    }
                    className="w-12 h-12 p-0 border-none"
                  />
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing & Subscription */}
          <TabsContent value="billing">
            <div className="space-y-6 max-w-xl">
              {/* Set Monthly Price */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Set Subscription Pricing
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-2">
                    Set the monthly price your app users will pay to access this facility in the app. You can also provide a promo code to allow users to get free access (e.g. if you collect payment directly).
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Input */}
                  <div>
                    <Label htmlFor="monthlyPrice">Monthly Price (in USD)</Label>
                    <Input
                      id="monthlyPrice"
                      type="number"
                      min="0"
                      value={facilityBilling.monthlyPrice}
                      onChange={e => setFacilityBilling({ ...facilityBilling, monthlyPrice: e.target.value })}
                      placeholder="Enter price per month"
                    />
                  </div>
                  {/* Promo Code Input */}
                  <div>
                    <Label htmlFor="promoCode">Promo Code (optional)</Label>
                    <Input
                      id="promoCode"
                      value={facilityBilling.promoCode}
                      onChange={e => setFacilityBilling({ ...facilityBilling, promoCode: e.target.value })}
                      placeholder="e.g. FREE2025"
                      maxLength={24}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Users who enter this promo code will get free access to the app for this facility.
                    </p>
                  </div>
                  {/* Save Button */}
                  <Button onClick={handleSaveBilling}>{isLoading ? "Updating..." : "Save Changes"}</Button>
                  {billingSaveStatus && (
                    <p className="text-sm mt-2" style={{ color: billingSaveStatus === "Saved!" ? "green" : "red" }}>{billingSaveStatus}</p>
                  )}
                </CardContent>
              </Card>

              {/* Current Settings Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Pricing & Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <span>
                      <span className="text-gray-600">Monthly Price: </span>
                      <span className="font-medium">${facilityBilling.monthlyPrice || "--"}</span>
                    </span>
                    <span>
                      <span className="text-gray-600">Promo Code: </span>
                      <span className="font-mono">{facilityBilling.promoCode || <span className="text-gray-400">None set</span>}</span>
                    </span>
                    <span>
                      <span className="text-gray-600">Stripe Price ID: </span>
                      <span className="font-mono text-sm">{facilityBilling.stripePriceId || <span className="text-gray-400">Not configured</span>}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
