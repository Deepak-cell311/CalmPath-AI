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
import { CreditCard, DollarSign, Download, Bell, Building, Users, Gift } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { authClient } from "@/lib/auth"
import { InviteUsageStats } from "@/components/InviteUsageStats"

export default function SettingsPage() {
  const { user } = useAuth();
  console.log("user:", user);
  const [facilityInfo, setFacilityInfo] = useState({
    id: "", // Add id field
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

  console.log("facilityInfo:", facilityInfo);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyReports: true,
    systemUpdates: true,
  })
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [facilityBilling, setFacilityBilling] = useState({
    monthlyPrice: "",      // e.g. "25"
    promoCode: "",         // e.g. "FREE2025"
    stripePriceId: "",     // Stripe price ID
  });
  const [billingSaveStatus, setBillingSaveStatus] = useState("");

  // Invite system state
  const [invitePackages, setInvitePackages] = useState<any[]>([]);
  const [invitePurchases, setInvitePurchases] = useState<any[]>([]);
  const [availableInvites, setAvailableInvites] = useState<any[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");

  // Load initial data and check for Stripe status
  useEffect(() => {
    // Check for success/cancel from Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    
    if (success) {
      setInviteStatus("Payment successful! Your invites will be available shortly.");
      // Reload invite data after successful payment
      setTimeout(() => {
        if (facilityInfo.id) {
          loadInviteData();
        }
        setInviteStatus("");
      }, 3000);
    } else if (canceled) {
      setInviteStatus("Payment was canceled.");
      setTimeout(() => setInviteStatus(""), 3000);
    }

    // Load facility info
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility`, {
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setFacilityInfo({
          id: data.id || "",
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.adminEmail || data.email || "",
          tagline: data.tagline || "",
          logoUrl: data.logoUrl || "",
          logoFile: null,
          logoPreview: null,
          brandColor: data.brandColor || "#3B82F6",
        });
      })
      .catch((error) => {
        console.error("Error loading facility info:", error);
      });

    // Load billing settings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/billing`, {
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setFacilityBilling({
          monthlyPrice: data.monthlyPrice || "",
          promoCode: data.promoCode || "",
          stripePriceId: data.stripePriceId || "",
        });
      })
      .catch(() => setBillingSaveStatus("Failed to load billing settings"));
  }, []);

  // Load invite data when facility ID is available
  useEffect(() => {
    if (facilityInfo?.id) {
      loadInviteData();
    }
  }, [facilityInfo?.id]);

  const loadInviteData = async () => {
    setIsLoadingInvites(true);
    try {
      const facilityId = facilityInfo.id;
      
      if (!facilityId) {
        console.error("No facility ID available");
        setInvitePackages([]);
        setInvitePurchases([]);
        setAvailableInvites([]);
        return;
      }

      // Load invite packages
      const packagesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/facility/invite-packages`,
        { headers: { 'Authorization': `Bearer ${authClient.getToken()}` } }
      );
      
      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        setInvitePackages(Array.isArray(packagesData) ? packagesData : []);
      } else {
        console.error("Failed to load invite packages:", packagesRes.status, await packagesRes.text());
        setInvitePackages([]);
      }

      // Load invite purchases
      const purchasesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/facility/invite-purchases`,
        { headers: { 'Authorization': `Bearer ${authClient.getToken()}` } }
      );
      
      if (purchasesRes.ok) {
        const purchasesData = await purchasesRes.json();
        setInvitePurchases(Array.isArray(purchasesData) ? purchasesData : []);
      } else {
        console.error("Failed to load invite purchases:", purchasesRes.status, await purchasesRes.text());
        setInvitePurchases([]);
      }

      // Load available invites
      const invitesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/facility/available-invites`,
        { headers: { 'Authorization': `Bearer ${authClient.getToken()}` } }
      );
      
      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setAvailableInvites(Array.isArray(invitesData) ? invitesData : []);
      } else {
        console.error("Failed to load available invites:", invitesRes.status, await invitesRes.text());
        setAvailableInvites([]);
      }
    } catch (error) {
      console.error("Error loading invite data:", error);
      setInviteStatus("Failed to load invite data");
      // Ensure arrays are set to empty arrays on error
      setInvitePackages([]);
      setInvitePurchases([]);
      setAvailableInvites([]);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  const refreshFacilityInfo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility`, {
        headers: {
          'Authorization': `Bearer ${authClient.getToken()}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setFacilityInfo({
          id: data.id || "",
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.adminEmail || data.email || "",
          tagline: data.tagline || "",
          logoUrl: data.logoUrl || "",
          logoFile: null,
          logoPreview: null,
          brandColor: data.brandColor || "#3B82F6",
        });
      }
    } catch (error) {
      console.error("Error refreshing facility info:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${authClient.getToken()}` },
        body: JSON.stringify(facilityInfo), // Send id as well
      });
      if (res.ok) {
        setSaveStatus("Saved!");
        refreshFacilityInfo(); // Refresh facility info after successful save
      } else {
        setSaveStatus("Failed to save");
      }
    } catch (error) {
      setSaveStatus("Failed to save");
    } finally {
      setIsLoading(false);
    }
  }


  const handleSaveBilling = async () => {
    setBillingSaveStatus("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${authClient.getToken()}` },
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
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility`, {
            headers: { 'Authorization': `Bearer ${authClient.getToken()}` }
          })
            .then(res => res.json())
            .then(data => {
              setFacilityInfo(prev => {
                const info = {
                  id: data.id || "",
                  name: data.name || "",
                  address: data.address || "",
                  phone: data.phone || "",
                  email: data.adminEmail || data.email || "",
                  tagline: data.tagline || "",
                  logoUrl: data.logoUrl || "",
                  logoFile: null,
                  logoPreview: null,
                  brandColor: data.brandColor || "#3B82F6",
                };
                // Load invite system data after facilityInfo.id is set
                if (info.id) {
                  loadInviteData();
                }
                return info;
              });
            })
            .catch(() => setSaveStatus("Failed to load facility info"));

          // Load billing settings
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/billing`, {
            headers: { 'Authorization': `Bearer ${authClient.getToken()}` }
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
        }, 500)
        setLogoError("Image upload failed. Please try a smaller image or check your connection.");
        return;
      }
      const data = await res.json();
      setFacilityInfo(prev => ({ ...prev, logoUrl: data.logoUrl }));
    } catch (error) {
      setLogoError("Image upload failed. Please try again.");
    }
  };

  const handlePurchaseInvites = async (packageId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/purchase-invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authClient.getToken()}` },
        body: JSON.stringify({ packageId }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else if (res.ok && data.simulated) {
        setInviteStatus("Invites created (dev mode)");
        await loadInviteData();
        setTimeout(() => setInviteStatus(""), 3000);
      } else {
        setInviteStatus("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error purchasing invites:", error);
      setInviteStatus("Failed to purchase invites");
    }
  };

  const handleCreateInvites = async (purchaseId: number, inviteCount: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/create-invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authClient.getToken()}` },
        body: JSON.stringify({ purchaseId, inviteCount }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
  setInviteStatus("Invite codes created successfully!");
  loadInviteData(); // Reload data
  setTimeout(() => setInviteStatus(""), 3000);
      } else {
        setInviteStatus(data.message || "Failed to create invite codes");
      }
    } catch (error) {
      console.error("Error creating invites:", error);
      setInviteStatus("Failed to create invite codes");
    }
  };

  const handleCompletePurchase = async (sessionId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authClient.getToken()}` },
        body: JSON.stringify({ sessionId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
  setInviteStatus("Purchase completed successfully!");
  loadInviteData(); // Reload data
  setTimeout(() => setInviteStatus(""), 3000);
      } else {
        setInviteStatus(data.message || "Failed to complete purchase");
      }
    } catch (error) {
      console.error("Error completing purchase:", error);
      setInviteStatus("Failed to complete purchase");
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('userId', user?.id || '');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/logo`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await res.json();
      
      // Update facility info with new logo URL
      setFacilityInfo(prev => ({ 
        ...prev, 
        logoUrl: data.logoUrl,
        logoFile: null,
        logoPreview: null
      }));
      
      // Also update the facility info in the backend
      if (data.facility) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            'Authorization': `Bearer ${authClient.getToken()}` 
          },
          body: JSON.stringify({
            ...facilityInfo,
            logoUrl: data.logoUrl
          }),
        });
      }
      
      setLogoError(null);
    } catch (error) {
      console.error('Logo upload error:', error);
      setLogoError('Image upload failed. Please try again.');
    }
  }

  const handleTestWebhook = async () => {
    if (!invitePurchases.length) {
      setInviteStatus("No recent purchase to test webhook for.");
      return;
    }
    const latestPurchase = invitePurchases[invitePurchases.length - 1];
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authClient.getToken()}` },
        body: JSON.stringify({ sessionId: latestPurchase.stripeSessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteStatus(`Webhook triggered successfully for session: ${latestPurchase.stripeSessionId}. Response: ${data.message}`);
        // Reload invite data after successful webhook test
        setTimeout(() => {
          loadInviteData();
          setInviteStatus("");
        }, 2000);
      } else {
        setInviteStatus(`Failed to trigger webhook for session: ${latestPurchase.stripeSessionId}. Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error triggering webhook:", error);
      setInviteStatus("Failed to trigger webhook. Please check console.");
    }
  };

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
            {/* <TabsTrigger value="billing">Billing & Subscription</TabsTrigger> */}
            <TabsTrigger value="invites">Flat Payment Invites</TabsTrigger>
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
                      value={`${facilityInfo?.name || user?.firstName} ${user?.lastName || "N/A"}`.trim()}
                      onChange={(e) => {
                        const fullName = e.target.value;
                        const [firstName, ...lastNameParts] = fullName.split(" ");
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={facilityInfo?.phone || ""}
                      onChange={(e) => setFacilityInfo({ ...facilityInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={facilityInfo?.address || ""}
                    onChange={(e) => setFacilityInfo({ ...facilityInfo, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || "N/A"}
                    onChange={(e) => {const email = e.target.value}}
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
                        // Frontend validation for max 10MB
                        if (file.size > 10 * 1024 * 1024) {
                          setLogoError("Max file size is 10MB. Please choose a smaller image.");
                          return;
                        }
                        setLogoError("");
                        handleLogoUpload(file);
                        setFacilityInfo(prev => ({ ...prev, logoFile: file }));
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
                  {logoError && (
                    <p className="text-sm text-red-600 mt-2">{logoError}</p>
                  )}
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
                        src={facilityInfo.logoUrl.startsWith("/uploads/") ? `${process.env.NEXT_PUBLIC_API_URL}${facilityInfo.logoUrl}` : facilityInfo.logoUrl}
                        alt="Facility Logo"
                        className="h-16 object-contain rounded border"
                        onError={e => { e.currentTarget.src = "/placeholder-logo.png"; }}
                      />
                    </div>
                  )}
                  {/* Fallback if no logo */}
                  {!facilityInfo.logoPreview && !facilityInfo.logoUrl && (
                    <div className="mt-2">
                      <img
                        src="/placeholder-logo.png"
                        alt="No Logo"
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

                <div className="flex gap-2">
                  <Button onClick={handleSave}>{isLoading ? "Updating..." : "Save Changes"}</Button>
                  <Button 
                    onClick={refreshFacilityInfo} 
                    variant="outline"
                    type="button"
                  >
                    Refresh
                  </Button>
                </div>
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

          {/* Flat Payment Invite System */}
          <TabsContent value="invites">
            <div className="space-y-6">
              {/* Invite Usage Statistics */}
              <InviteUsageStats />
              
              {/* Available Packages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Purchase Invite Packages
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-2">
                    Purchase invite packages to give access to your facility. Users with invite codes will get free access without needing to pay individually.
                  </p>
                </CardHeader>
                <CardContent>
                  {isLoadingInvites ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading packages...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Array.isArray(invitePackages) && invitePackages.map((pkg: any) => (
                        <Card key={pkg.id} className="border-2 hover:border-blue-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h3 className="font-semibold text-lg">{pkg.packageName}</h3>
                              <p className="text-2xl font-bold text-blue-600 mt-2">
                                ${(pkg.priceInCents / 100).toFixed(0)}
                              </p>
                              <p className="text-gray-600 text-sm mt-1">
                                {pkg.inviteCount} invites
                              </p>
                              <Button 
                                onClick={() => handlePurchaseInvites(pkg.id)}
                                className="w-full mt-4"
                              >
                                Purchase Package
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Available Invites */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Available Invite Codes
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-2">
                    These are the invite codes you can share with users. Each code can be used once to give free access to your facility.
                  </p>
                </CardHeader>
                <CardContent>
                  {(!Array.isArray(availableInvites) || availableInvites.length === 0) ? (
                    <p className="text-gray-500 text-center py-4">No available invites. Purchase a package to get invite codes.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableInvites.map((invite: any) => (
                        <div key={invite.id} className="p-3 border rounded-lg bg-gray-50">
                          <p className="font-mono text-sm bg-white p-2 rounded border text-center">
                            {invite.inviteCode}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            Status: {invite.status || 'unused'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            Created: {new Date(invite.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}