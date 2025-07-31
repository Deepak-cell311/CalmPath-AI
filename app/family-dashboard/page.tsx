"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, Camera, MessageCircle, Bell, User, LogOut, Plus, Upload, X, Tag, CreditCard } from "lucide-react"
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { toast } from "@/hooks/use-toast";

interface MemoryPhoto {
    id: number
    name: string
    date: string
    tags: string[]
    description: string
    url: string
    context: string
}

interface Medication {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    time: string;
}

interface Reminder {
    id: number;
    message: string;
    scheduledTime: string;
    isActive: boolean;
    isCompleted: boolean;
}

export default function FamilyDashboard() {
    const loading = useAuthRedirect();
    // if (loading) return <div>Loading...</div>;

    const [photos, setPhotos] = useState<MemoryPhoto[]>([])
    const [patientId, setPatientId] = useState<number>(1); // Set default patient ID to 1
    const [isLoading, setIsLoading] = useState(false);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [billingSaveStatus, setBillingSaveStatus] = useState("");
    const [newReminder, setNewReminder] = useState({ message: "", scheduledTime: "" });
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [facilityMonthlyPrice, setFacilityMonthlyPrice] = useState("25"); // fetched from backend
    const [facilityStripePriceId, setFacilityStripePriceId] = useState(""); // fetched from backend
    const [facilityPromoCode, setFacilityPromoCode] = useState(""); // fetched from backend
    const [userPromoCode, setUserPromoCode] = useState("");
    const [promoCodeStatus, setPromoCodeStatus] = useState("");
    const [discountAmount, setDiscountAmount] = useState<number | null>(null);
    const [discountType, setDiscountType] = useState<"percent" | "amount" | null>(null);
    const [conversations, setConversations] = useState([
        { id: 1, date: "2024-01-15", duration: "5 min", mood: "calm", summary: "Talked about morning routine" },
        { id: 2, date: "2024-01-14", duration: "8 min", mood: "happy", summary: "Shared memories about gardening" },
    ])
    const [personalInfo, setPersonalInfo] = useState({
        work: "Retired engineer, worked on bridges and infrastructure projects.",
        family: "Wife: Mary (passed away), Children: John, Sarah. Grandchildren: Emily, David, Olivia.",
        hobbies: "Gardening (especially roses), reading historical novels, playing chess, listening to classical music.",
        food: "Shepherd's pie, apple crumble, strong black coffee.",
        other: "Loves quiet mornings, enjoys talking about his youth, can get agitated by loud noises.",
    })
    const [newPhoto, setNewPhoto] = useState({
        name: "",
        description: "",
        tags: "",
        context: "",
        file: null as File | null,
    })
    const [newMedication, setNewMedication] = useState({
        name: "",
        dosage: "",
        frequency: "",
        time: "",
    });
    const [facilityBilling, setFacilityBilling] = useState({
        monthlyPrice: "",      // e.g. "25"
        promoCode: "",         // e.g. "FREE2025"
    });
    const [user, setUser] = useState<any>(null)
    const [userUsedInviteCode, setUserUsedInviteCode] = useState(false)
    const router = useRouter()
    const [notifiedReminders, setNotifiedReminders] = useState<number[]>([]);
    const [notificationList, setNotificationList] = useState<{id: number, message: string, time: string, seen: boolean}[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);


    const fetchExistingPhotos = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/memoryPhotos`, {
                method: "GET",
                // credentials: "include",
            });

            const result = await response.json();
            if (response.ok && Array.isArray(result.data)) {
                setPhotos(result.data.map((photo: any) => ({
                    id: photo.id || Date.now(),
                    name: photo.photoname,
                    date: new Date(photo.created_at || Date.now()).toLocaleDateString(),
                    tags: photo.tags,
                    description: photo.description,
                    url: photo.file,
                    context: photo.contextAndStory,
                })));
            }
        } catch (error) {
            console.error("Error fetching photos:", error);
        }
    };

    useEffect(() => {
        fetchExistingPhotos();
        fetchUserInviteStatus();
    }, []);

    const fetchUserInviteStatus = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/currentUser`, {
                credentials: "include"
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setUserUsedInviteCode(userData.usedInviteCode || false);
            }
        } catch (error) {
            console.error("Error fetching user invite status:", error);
        }
    }

    useEffect(() => {
        if (!patientId) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/medications`, {
            //credentials: "include" 
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setMedications(data);
            })
            .catch((err) => console.error("Error fetching medications:", err));
    }, [patientId]);

    // Fetch facility billing settings
    const fetchFacilityBilling = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/billing`);
            if (res.ok) {
                const data = await res.json();
                setFacilityMonthlyPrice(data.monthlyPrice || "25");
                setFacilityStripePriceId(data.stripePriceId || "");
                setFacilityPromoCode(data.promoCode || "");
            }
        } catch (error) {
            console.error("Error fetching facility billing:", error);
        }
    };

    useEffect(() => {
        fetchFacilityBilling();
    }, []);





    const handleAddMedication = async () => {
        if (!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.time || !patientId) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/medications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // credentials: "include",
                body: JSON.stringify(newMedication),
            });
            if (res.ok) {
                const med = await res.json();
                setMedications((prev) => [...prev, med]);
                setNewMedication({ name: "", dosage: "", frequency: "", time: "" });
            }
        } catch (err) {
            console.error("Error adding medication:", err);
        }
    };

    const handleRemoveMedication = async (id: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/medications/${id}`, {
                method: "DELETE",
                // credentials: "include",
            });
            if (res.ok) {
                setMedications((prev) => prev.filter((med) => med.id !== id));
            }
        } catch (err) {
            console.error("Error deleting medication:", err);
        }
    };
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setNewPhoto((prev) => ({ ...prev, file }))
        }
    }

    const handleUploadPhoto = async () => {
        if (!newPhoto.file) return;

        const formData = new FormData();
        formData.append("photo", newPhoto.file); // field name must match backend
        formData.append("photoname", newPhoto.name);
        formData.append("description", newPhoto.description);
        formData.append("tags", JSON.stringify(newPhoto.tags.split(",").map(tag => tag.trim()).filter(Boolean)));
        formData.append("contextAndStory", newPhoto.context);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/memoryPhotos`, {
                method: "POST",
                body: formData,
                // credentials: "include", // if using session/cookie auth
            });

            const result = await response.json();
            console.log("Response: ", result)

            if (response.ok && result.data) {
                const photo = result.data;
                setPhotos((prev) => [
                    ...prev,
                    {
                        id: Date.now(), // Generate a unique ID since the API doesn't return one
                        name: photo.photoname,
                        date: new Date().toLocaleDateString(), // Use current date since API doesn't return created_at
                        tags: photo.tags,
                        description: photo.description,
                        url: photo.file,
                        context: photo.contextAndStory,
                    }
                ]);
                setIsUploadDialogOpen(false);
                // Reset the form
                setNewPhoto({
                    name: "",
                    description: "",
                    tags: "",
                    context: "",
                    file: null,
                });
            } else {
                console.error("Upload failed:", result);
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
        }
    };




    const removePhoto = async (photoId: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/memoryPhotos/${photoId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
            } else {
                alert("Failed to delete photo from server.");
            }
        } catch (error) {
            console.error("Error deleting photo:", error);
            alert("Error deleting photo.");
        }
    };

    const handlePersonalInfoChange = (field: string, value: string) => {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }))
    }

    const handleSavePersonalInfo = () => {
        // In a real application, you would send this data to a backend
        console.log("Saving personal info:", personalInfo)
        alert("Personal information saved!")
    }



    // Fetch reminders for the patient
    const fetchReminders = async () => {
        try {
            if (!patientId) {
                console.log("No patient ID, skipping fetch reminders");
                return;
            }

            console.log("Fetching reminders for patient:", patientId);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/reminders`);
            console.log("Fetch reminders response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched reminders:", data);
                setReminders(data);
            } else {
                console.error("Failed to fetch reminders, status:", response.status);
                const errorData = await response.json().catch(() => ({}));
                console.error("Error data:", errorData);
            }
        } catch (error) {
            console.error("Error fetching reminders:", error);
        }
    };




    // Add reminder
    const handleAddReminder = async () => {
        if (!newReminder.message || !newReminder.scheduledTime || !patientId) {
            console.log("Validation failed:", { message: newReminder.message, scheduledTime: newReminder.scheduledTime, patientId });
            alert("Please fill in all fields and ensure patient is selected");
            return;
        }

        const scheduledDate = new Date(newReminder.scheduledTime);
        const now = new Date();

        // if (scheduledDate <= now) {
        //     alert("Scheduled time must be in the future.");
        //     return;
        // }

        console.log("Adding reminder:", { newReminder, patientId });
        console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/reminders`);

        try {
            const requestBody = {
                message: newReminder.message,
                scheduledTime: new Date(newReminder.scheduledTime).toISOString(), // Always send ISO string
                createdBy: "family-member", // In a real app, this would be the actual user ID
            };

            console.log("Request body:", requestBody);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/reminders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);

            if (response.ok) {
                const newReminderData = await response.json();
                console.log("Success! New reminder data:", newReminderData);
                setReminders(prev => [...prev, newReminderData]);
                setNewReminder({ message: "", scheduledTime: "" });
                alert("Reminder added successfully!");
            } else {
                const error = await response.json();
                console.error("Failed to create reminder:", error);
                alert("Failed to create reminder: " + error.message);
            }
        } catch (error) {
            console.error("Error creating reminder:", error);
            alert("Failed to create reminder: " + (error as Error).message);
        }
    };

    // Remove reminder
    const handleRemoveReminder = async (id: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reminders/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setReminders(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Failed to delete reminder");
            }
        } catch (error) {
            console.error("Error deleting reminder:", error);
            alert("Failed to delete reminder");
        }
    };



    const handleStartSubscription = async () => {
        setIsLoading(true);
        try {
            // Check if Stripe key is available
            const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
            if (!stripePublishableKey) {
                throw new Error("Stripe publishable key is not configured");
            }

            // Load Stripe
            const stripe = await loadStripe(stripePublishableKey);

            if (!stripe) {
                throw new Error("Stripe failed to load");
            }

            // Check if API URL is available
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                throw new Error("API URL is not configured");
            }

            // Use facility's Stripe price ID if available, otherwise fallback to default
            const priceId = facilityStripePriceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
            if (!priceId) {
                throw new Error("No Stripe price ID configured");
            }

            // Create checkout session
            const res = await fetch(`${apiUrl}/api/billing/checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId: priceId,
                    customerEmail: "user@example.com", // Replace with actual user email
                    metadata: {
                        facilityId: "1", // Replace with actual facility ID
                    },
                    couponId: discountAmount ? facilityStripePriceId : undefined, // Apply coupon if discount available
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error: any) {
            console.error("Subscription error:", error);
            alert("Failed to start subscription: " + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSaveBilling = () => {
        // In a real app, you would send this data to a backend
        console.log("Saving billing info:", facilityBilling)
        alert("Billing information saved!")
    }

    async function handleApplyPromoCode() {
        if (!userPromoCode.trim()) {
            setPromoCodeStatus("Please enter a promo code.");
            return;
        }

        setIsLoading(true);
        setPromoCodeStatus("");
        setDiscountAmount(null);
        setDiscountType(null);

        try {
            // First check if it matches the facility's promo code
            if (userPromoCode.trim().toLowerCase() === facilityPromoCode.toLowerCase()) {
                setPromoCodeStatus("Access Granted!");
                setDiscountAmount(100);
                setDiscountType("percent");
                return;
            }

            // If not facility promo code, validate with Stripe
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/validate-coupon`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: userPromoCode.trim() }),
            });

            const data = await res.json();

            if (data.valid) {
                setPromoCodeStatus("Access Granted!");
                setDiscountAmount(data.discount);
                setDiscountType(data.type);
            } else {
                setPromoCodeStatus(data.message || "Invalid promo code.");
            }
        } catch (err) {
            console.error("Error validating promo:", err);
            setPromoCodeStatus("Server error. Try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogout = async () => {
        try {
            // Call logout API if available
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include"
            })
        } catch (error) {
            console.error("Error during logout:", error)
        }

        // Clear any stored auth tokens/data
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")
        sessionStorage.clear()
        setUser(null)

        // Redirect to login page
        router.push("/auth/login")
    }


    useEffect(() => {
        if (patientId) {
            fetchReminders();
        }
    }, [patientId]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            reminders.forEach(reminder => {
                const reminderTime = new Date(reminder.scheduledTime);
                if (
                    reminderTime <= now &&
                    !notifiedReminders.includes(reminder.id)
                ) {
                    toast({
                        title: "Reminder",
                        description: reminder.message,
                    });
                    setNotifiedReminders(prev => [...prev, reminder.id]);
                    setNotificationList(prev => [
                        { id: reminder.id, message: reminder.message, time: reminder.scheduledTime, seen: false },
                        ...prev,
                    ]);
                }
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [reminders, notifiedReminders]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">CalmPath Family</h1>
                            <p className="text-gray-600">Care Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                className="relative focus:outline-none"
                                onClick={() => {
                                    setShowNotifications((prev) => !prev);
                                    // Mark all as seen when opening
                                    setNotificationList((prev) => prev.map(n => ({ ...n, seen: true })));
                                }}
                            >
                                <Bell className="w-5 h-5 text-gray-400" />
                                {notificationList.filter(n => !n.seen).length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                        {notificationList.filter(n => !n.seen).length}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
                                    <div className="flex items-center justify-between px-4 py-2 border-b">
                                        <span className="font-semibold">Notifications</span>
                                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                                            <span className="sr-only">Close</span>
                                            &#10005;
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notificationList.length === 0 ? (
                                            <div className="p-4 text-gray-500 text-center">No notifications</div>
                                        ) : (
                                            notificationList.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`px-4 py-3 border-b last:border-b-0 ${n.seen ? 'bg-gray-100 text-gray-800 opacity-100' : 'bg-blue-50 text-blue-900 font-semibold'}`}
                                                    style={n.seen ? { filter: 'blur(0.5px)' } : {}}
                                                >
                                                    <div className="text-sm">{n.message}</div>
                                                    <div className="text-xs mt-1">{new Date(n.time).toLocaleString()}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" size="sm">
                            <User className="w-4 h-4 mr-2" />
                            John Smith
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <div className="max-w-6xl mx-auto">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="photos">Memory Photos</TabsTrigger>
                            <TabsTrigger value="medications">Medications</TabsTrigger>
                            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
                            <TabsTrigger value="billing">Billing</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {/* Status Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">3</div>
                                        <p className="text-xs text-muted-foreground">+1 from yesterday</p>
                                    </CardContent>
                                </Card>
                                {/* Removed Average Mood card */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Memory Photos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{photos.length}</div>
                                        <p className="text-xs text-muted-foreground">Available for recall</p>
                                    </CardContent>
                                </Card>
                            </div>
                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest interactions and updates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                                            <MessageCircle className="w-5 h-5 text-blue-600" />
                                            <div className="flex-1">
                                                <p className="font-medium">Morning conversation completed</p>
                                                <p className="text-sm text-gray-600">5 minutes ago • Mood: Calm</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                                            <Camera className="w-5 h-5 text-green-600" />
                                            <div className="flex-1">
                                                <p className="font-medium">Photo memory triggered</p>
                                                <p className="text-sm text-gray-600">2 hours ago • "Family Home" shown</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="photos" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Memory Photos</CardTitle>
                                            <CardDescription>Upload and manage photos with context for AI memory recall</CardDescription>
                                        </div>
                                        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Upload Photo
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
                                                <DialogHeader>
                                                    <DialogTitle>Upload Memory Photo</DialogTitle>
                                                    <DialogDescription>
                                                        Add a photo with context and tags so the AI can show it when relevant
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="photo-file">Photo</Label>
                                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                            <div className="space-y-1 text-center">
                                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                                <div className="flex text-sm text-gray-600">
                                                                    <label
                                                                        htmlFor="photo-file"
                                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                                                                    >
                                                                        <span>Upload a file</span>
                                                                        <input
                                                                            id="photo-file"
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="sr-only"
                                                                            onChange={handleFileUpload}
                                                                        />
                                                                    </label>
                                                                    <p className="pl-1">or drag and drop</p>
                                                                </div>
                                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                                            </div>
                                                        </div>
                                                        {newPhoto.file && (
                                                            <p className="mt-2 text-sm text-green-600">Selected: {newPhoto.file.name}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="photo-name">Photo Name</Label>
                                                        <Input
                                                            id="photo-name"
                                                            value={newPhoto.name}
                                                            onChange={(e) => setNewPhoto((prev) => ({ ...prev, name: e.target.value }))}
                                                            placeholder="e.g., Family Home, Garden, Birthday Party"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="photo-description">Description</Label>
                                                        <Textarea
                                                            id="photo-description"
                                                            value={newPhoto.description}
                                                            onChange={(e) => setNewPhoto((prev) => ({ ...prev, description: e.target.value }))}
                                                            placeholder="Brief description of the photo"
                                                            rows={2}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="photo-tags">Tags (comma-separated)</Label>
                                                        <Input
                                                            id="photo-tags"
                                                            value={newPhoto.tags}
                                                            onChange={(e) => setNewPhoto((prev) => ({ ...prev, tags: e.target.value }))}
                                                            placeholder="home, family, garden, birthday, etc."
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">These help the AI know when to show this photo</p>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="photo-context">Context & Story</Label>
                                                        <Textarea
                                                            id="photo-context"
                                                            value={newPhoto.context}
                                                            onChange={(e) => setNewPhoto((prev) => ({ ...prev, context: e.target.value }))}
                                                            placeholder="Share the story behind this photo - what makes it special?"
                                                            rows={3}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            This context helps the AI provide meaningful conversation about the photo
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button onClick={handleUploadPhoto} className="flex-1">
                                                            Upload Photo
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {photos.map((photo) => (
                                            <Card key={photo.id} className="overflow-hidden">
                                                <div className="aspect-video bg-gray-100 relative">
                                                    <img
                                                        src={photo.url || "/placeholder.svg"}
                                                        alt={photo.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => removePhoto(photo.id)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-medium mb-2">{photo.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                                                    <p className="text-xs text-gray-500 mb-2">{photo.date}</p>
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {photo.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1"
                                                            >
                                                                <Tag className="w-3 h-3" />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {photo.context && (
                                                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                            <strong>Context:</strong> {photo.context}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="medications" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reminders</CardTitle>
                                    <CardDescription>
                                        Create reminders for yourself. You’ll get a popup alert in your browser at the set time.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Add Reminder */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="reminder-message">Reminder Message</Label>
                                                <Input
                                                    id="reminder-message"
                                                    value={newReminder.message}
                                                    onChange={(e) => setNewReminder((prev) => ({ ...prev, message: e.target.value }))}
                                                    placeholder="e.g., Take your medication"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="reminder-time">Time</Label>
                                                <Input
                                                    id="reminder-time"
                                                    type="datetime-local"
                                                    value={newReminder.scheduledTime}
                                                    onChange={(e) => setNewReminder((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button onClick={handleAddReminder} className="w-full">
                                                    <Plus className="w-4 h-4 mr-2" /> Add Reminder
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Current Reminders */}
                                        <h3 className="text-lg font-semibold mt-6 mb-3">Current Reminders</h3>
                                        {reminders.length === 0 ? (
                                            <p className="text-gray-600">No reminders added yet.</p>
                                        ) : (
                                            <ScrollArea className="h-64 border rounded-lg p-4">
                                                <div className="space-y-3">
                                                    {reminders.map((rem) => (
                                                        <div key={rem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div>
                                                                <p className="font-medium">{rem.message}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {new Date(rem.scheduledTime).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <Button variant="destructive" size="sm" onClick={() => handleRemoveReminder(rem.id)}>
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="personal-info" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Patient Personal Information</CardTitle>
                                    <CardDescription>
                                        Provide details about the patient to help the AI personalize conversations.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="work-history">Work History / Career</Label>
                                        <Textarea
                                            id="work-history"
                                            value={personalInfo.work}
                                            onChange={(e) => handlePersonalInfoChange("work", e.target.value)}
                                            placeholder="e.g., Retired teacher, worked for 30 years at Lincoln High School."
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">What kind of work did the patient do?</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="family-names">Family Members & Relationships</Label>
                                        <Textarea
                                            id="family-names"
                                            value={personalInfo.family}
                                            onChange={(e) => handlePersonalInfoChange("family", e.target.value)}
                                            placeholder="e.g., Spouse: Jane, Children: Mark, Lisa. Grandchildren: Alex, Sarah."
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Names of important family members and their relation.</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="hobbies">Hobbies & Interests</Label>
                                        <Textarea
                                            id="hobbies"
                                            value={personalInfo.hobbies}
                                            onChange={(e) => handlePersonalInfoChange("hobbies", e.target.value)}
                                            placeholder="e.g., Painting, gardening, playing golf, listening to jazz music."
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">What does the patient enjoy doing?</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="favorite-foods">Favorite Foods</Label>
                                        <Textarea
                                            id="favorite-foods"
                                            value={personalInfo.food}
                                            onChange={(e) => handlePersonalInfoChange("food", e.target.value)}
                                            placeholder="e.g., Apple pie, roast chicken, mashed potatoes."
                                            rows={2}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Foods that bring comfort or good memories.</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="other-details">Other Important Details</Label>
                                        <Textarea
                                            id="other-details"
                                            value={personalInfo.other}
                                            onChange={(e) => handlePersonalInfoChange("other", e.target.value)}
                                            placeholder="e.g., Loves animals, has a pet cat named Whiskers, enjoys quiet environments."
                                            rows={4}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Any other details that help personalize interaction.</p>
                                    </div>
                                    <Button onClick={handleSavePersonalInfo} className="w-full">
                                        Save Personal Info
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="billing" className="space-y-6 max-w-lg mx-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Subscription Access
                                    </CardTitle>
                                    <CardDescription>
                                        Subscribe to unlock full access, or enter a promo code if your facility has provided one.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Payment Option */}
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Pay & Subscribe</h3>
                                        {userUsedInviteCode ? (
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center gap-2 text-green-700">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span className="font-medium">Free Access Granted</span>
                                                </div>
                                                <p className="text-sm text-green-600 mt-1">
                                                    You have free access to this facility through your invite code.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-gray-600 mb-2">
                                                    Monthly price:
                                                    {discountAmount && discountType ? (
                                                        <span className="font-medium text-green-600">
                                                            $
                                                            {discountType === "percent"
                                                                ? (Number(facilityMonthlyPrice) * (1 - Number(discountAmount) / 100)).toFixed(2)
                                                                : Math.max(Number(facilityMonthlyPrice) - Number(discountAmount), 0).toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="font-medium text-primary">${facilityMonthlyPrice}</span>
                                                    )}
                                                </p>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={handleStartSubscription}
                                                    disabled={isLoading}
                                                >
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    {isLoading ? "Processing..." : "Subscribe"}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center my-4">
                                        <span className="text-gray-400 text-xs uppercase">or</span>
                                    </div>
                                    {/* Promo Code Option */}
                                    {!userUsedInviteCode && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Have a Promo Code?</h3>
                                            <Input
                                                id="promoCode"
                                                value={userPromoCode}
                                                onChange={e => setUserPromoCode(e.target.value)}
                                                placeholder="Enter promo code"
                                                maxLength={24}
                                            />
                                            <Button className="w-full mt-2" variant="outline" onClick={handleApplyPromoCode}>
                                                Apply Promo Code
                                            </Button>
                                            {promoCodeStatus && (
                                                <p className="text-sm mt-2" style={{ color: promoCodeStatus === "Access Granted!" ? "green" : "red" }}>
                                                    {promoCodeStatus}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}