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
    console.log("FamilyDashboard: Component rendered, loading state:", loading);

    // All hooks must be called at the top level, before any conditional returns
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
    const [notificationList, setNotificationList] = useState<{ id: number, message: string, time: string, seen: boolean }[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // New state variables for payment status tracking
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>("inactive");
    const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
    const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);


    useEffect(() => {
        fetchExistingPhotos();
        fetchUserInviteStatus();
    }, []);

    const fetchExistingPhotos = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/memoryPhotos`, {
                method: "GET",
                credentials: "include",
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



    const fetchUserInviteStatus = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No auth token found");
                return;
            }

            console.log("Family Dashboard: Fetching user invite status with token:", token.substring(0, 20) + "...");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("Family Dashboard: User token response status:", response.status);

            if (response.ok) {
                const userData = await response.json();
                console.log("Family Dashboard: User data received:", userData);
                setUser(userData);
                setUserUsedInviteCode(userData.usedInviteCode || false);
            } else {
                console.error("Family Dashboard: Failed to fetch user data:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error fetching user invite status:", error);
        }
    }

    useEffect(() => {
        if (!patientId) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/medications`, {
            credentials: "include"
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/billing`, {
                credentials: 'include'
            });
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

    // Fetch user's payment/subscription status
    const fetchPaymentStatus = async () => {
        if (!user?.id) {
            console.log("fetchPaymentStatus: No user ID available");
            return;
        }

        console.log("fetchPaymentStatus: Starting for user:", user.id);
        setIsLoadingPaymentStatus(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.log("fetchPaymentStatus: No auth token found");
                return;
            }

            console.log("fetchPaymentStatus: Making API call to /api/billing/subscription");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/subscription`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("fetchPaymentStatus: Response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("fetchPaymentStatus: Success response:", data);
                setSubscriptionStatus(data.subscription.status || "inactive");
                setSubscriptionDetails(data.subscription);
            } else if (response.status === 404) {
                console.log("fetchPaymentStatus: 404 - No subscription found, checking invite code");
                // No subscription found, check if user has used invite code
                // If user used invite code, they are considered a "paid user" through facility
                if (userUsedInviteCode) {
                    console.log("fetchPaymentStatus: Setting status to invite_access");
                    setSubscriptionStatus("invite_access");
                } else {
                    console.log("fetchPaymentStatus: Setting status to inactive");
                    setSubscriptionStatus("inactive");
                }
                // Clear subscription details since there's no active subscription
                setSubscriptionDetails(null);
            } else {
                // Handle other error statuses
                console.error("fetchPaymentStatus: Error status:", response.status);
                setSubscriptionStatus("error");
                setSubscriptionDetails(null);
            }
        } catch (error) {
            console.error("fetchPaymentStatus: Exception occurred:", error);
            setSubscriptionStatus("error");
            setSubscriptionDetails(null);
        } finally {
            setIsLoadingPaymentStatus(false);
        }
    };

    // Fetch invite usage statistics for the facility
    // const fetchInviteUsageStats = async () => {
    //     if (!user?.facilityId) return;

    //     try {
    //         const token = localStorage.getItem('authToken');
    //         if (!token) return;

    //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/invite-limits`, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //                 'Content-Type': 'application/json'
    //             }
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             // setInviteUsageStats({ // This state was removed, so this line is removed
    //             //     totalInvites: data.totalInvites || 0,
    //             //     usedInvites: data.usedInvites || 0,
    //             //     availableInvites: data.availableInvites || 0
    //             // });
    //         }
    //     } catch (error) {
    //         console.error("Error fetching invite usage stats:", error);
    //     }
    // };

    useEffect(() => {
        fetchFacilityBilling();
    }, []);





    const handleAddMedication = async () => {
        if (!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.time || !patientId) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/medications`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("authToken")}` },
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/reminders`, {
                credentials: 'include'
            });
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

    useEffect(() => {
        if (patientId) {
            fetchReminders();
        }
    }, [patientId]);



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
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("authToken")}` },
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
        setIsPaymentProcessing(true);
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
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("authToken")}` },
                body: JSON.stringify({
                    priceId: priceId,
                    customerEmail: user?.email || "user@example.com", // Use actual user email
                    metadata: {
                        facilityId: user?.facilityId || "1", // Use actual facility ID
                    },
                    couponId: discountAmount ? facilityStripePriceId : undefined, // Apply coupon if discount available
                    credentials: "include"
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            if (data.url) {
                // Store subscription intent for status refresh
                localStorage.setItem('subscriptionIntent', 'pending');

                // Store the session ID for debugging
                if (data.sessionId) {
                    localStorage.setItem('stripeSessionId', data.sessionId);
                    console.log('Stripe session ID stored:', data.sessionId);
                }

                // Add success and cancel URLs to the checkout session
                const checkoutUrl = new URL(data.url);
                checkoutUrl.searchParams.set('success_url', `${window.location.origin}/family-dashboard?checkout_status=success`);
                checkoutUrl.searchParams.set('cancel_url', `${window.location.origin}/family-dashboard?checkout_status=cancel`);

                window.location.href = checkoutUrl.toString();
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error: any) {
            console.error("Subscription error:", error);
            alert("Failed to start subscription: " + error.message);
        } finally {
            setIsLoading(false);
            setIsPaymentProcessing(false);
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
                // Refresh payment status after successful promo code application
                setTimeout(() => {
                    fetchPaymentStatus();
                    // fetchInviteUsageStats(); // This line was removed
                }, 1000);
                return;
            }

            // If not facility promo code, validate with Stripe
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/validate-coupon`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("authToken")}` },
                body: JSON.stringify({ code: userPromoCode.trim() }),
                credentials: "include"
            });

            const data = await res.json();

            if (data.valid) {
                setPromoCodeStatus("Access Granted!");
                setDiscountAmount(data.discount);
                setDiscountType(data.type);
                // Refresh payment status after successful promo code application
                setTimeout(() => {
                    fetchPaymentStatus();
                    // fetchInviteUsageStats(); // This line was removed
                }, 1000);
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
        // Clear any stored auth tokens/data
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")
        sessionStorage.clear()
        setUser(null)

        // Redirect to login page
        router.push("/auth/login")
    }



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

    // New useEffect for fetching payment status and invite usage
    useEffect(() => {
        if (user?.id && user?.email) {
            console.log("Fetching payment status for user:", user.id);
            fetchPaymentStatus();
            // fetchInviteUsageStats(); // This line was removed
        }
    }, [user?.id, user?.email]);

    // Check for pending subscription status with polling
    useEffect(() => {
        const subscriptionIntent = localStorage.getItem('subscriptionIntent');
        if (subscriptionIntent === 'pending' && user?.id) {
            setIsPaymentProcessing(true);

            // Poll for payment status updates
            const pollInterval = setInterval(async () => {
                await fetchPaymentStatus();

                // If we get an active status, stop polling
                if (subscriptionStatus === 'active') {
                    localStorage.removeItem('subscriptionIntent');
                    setIsPaymentProcessing(false);
                    clearInterval(pollInterval);
                }
            }, 2000); // Check every 2 seconds

            // Stop polling after 30 seconds (15 attempts)
            setTimeout(() => {
                clearInterval(pollInterval);
                localStorage.removeItem('subscriptionIntent');
                setIsPaymentProcessing(false);
            }, 30000);

            return () => clearInterval(pollInterval);
        }
    }, [user?.id, subscriptionStatus]);

    // Check URL parameters for Stripe checkout return
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const checkoutStatus = urlParams.get('checkout_status');

        if (sessionId || checkoutStatus) {
            if (checkoutStatus === 'success') {
                // Success - refresh payment status and show success message
                localStorage.setItem('subscriptionIntent', 'pending');
                setIsPaymentProcessing(true);
                setTimeout(() => {
                    fetchPaymentStatus();
                }, 2000);

                // Show success notification
                alert('Payment successful! Your subscription is being activated.');
            } else if (checkoutStatus === 'cancel') {
                // Cancelled - clear any pending status
                localStorage.removeItem('subscriptionIntent');
                setIsPaymentProcessing(false);
                alert('Payment was cancelled. You can try again anytime.');
            }

            // Clean up URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [user?.id]);


    // Loading check must come after all hooks are called
    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
        </div>
    </div>;

    // Handle subscription management
    const handleManageSubscription = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/portal-session`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                }
            } else {
                alert("Failed to open billing portal. Please try again.");
            }
        } catch (error) {
            console.error("Error opening billing portal:", error);
            alert("Failed to open billing portal. Please try again.");
        }
    };

    // Manual subscription activation function (for when webhooks fail)
    const handleManualActivation = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert("No auth token found");
                return;
            }

            // Get the session ID from localStorage (set during checkout)
            const storedSessionId = localStorage.getItem('stripeSessionId');

            if (!storedSessionId) {
                alert("No Stripe session ID found. Please try subscribing again.");
                return;
            }

            console.log('Manual activation for session:', storedSessionId, 'user:', user?.id);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/manual-activate`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: storedSessionId,
                    userId: user?.id
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Subscription activated successfully! ${data.message}`);
                // Clear the stored session ID
                localStorage.removeItem('stripeSessionId');
                localStorage.removeItem('subscriptionIntent');
                // Refresh payment status
                setTimeout(() => {
                    fetchPaymentStatus();
                }, 1000);
            } else {
                const errorData = await response.json();
                alert(`Manual activation failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error in manual activation:", error);
            alert("Failed to activate subscription. Check console for details.");
        }
    };

    // Manual webhook test function for debugging
    const handleTestWebhook = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert("No auth token found");
                return;
            }

            // Get the session ID from localStorage (set during checkout)
            const storedSessionId = localStorage.getItem('stripeSessionId');
            const subscriptionIntent = localStorage.getItem('subscriptionIntent');

            if (!subscriptionIntent || subscriptionIntent !== 'pending') {
                alert("No pending subscription found. Please try subscribing again.");
                return;
            }

            let sessionId = storedSessionId;

            // If no stored session ID, prompt user to enter it
            if (!sessionId) {
                sessionId = prompt("Enter the Stripe session ID from your payment confirmation email:");
                if (!sessionId) return;
            } else {
                console.log('Using stored session ID:', sessionId);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/test-subscription-webhook`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    userId: user?.id
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Webhook test successful! ${data.message}`);
                // Clear the pending status
                localStorage.removeItem('subscriptionIntent');
                localStorage.removeItem('stripeSessionId');
                // Refresh payment status
                setTimeout(() => {
                    fetchPaymentStatus();
                }, 1000);
            } else {
                const errorData = await response.json();
                alert(`Webhook test failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error testing webhook:", error);
            alert("Failed to test webhook. Check console for details.");
        }
    };

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
                        {/* <div className="relative">
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
                        </div> */}
                        <Button variant="ghost" size="sm">
                            <User className="w-4 h-4 mr-2" />
                            {user?.firstName} {user?.lastName}
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

                        <TabsContent value="billing" className="max-w-6xl mx-auto">
                            <Card>
                                <CardHeader className="text-center">
                                    <CardTitle className="flex items-center justify-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Subscription Access
                                    </CardTitle>
                                    <CardDescription>
                                        Subscribe to unlock full access, or enter a promo code if your facility has provided one.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Side - Info Section */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Your Account Info</h3>

                                            {/* Access Summary */}
                                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                                                <div className="space-y-3">
                                                    <div className="inline-block justify-end">
                                                        <div
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${subscriptionStatus === "active" || subscriptionStatus === "invite_access"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {subscriptionStatus === "active" || subscriptionStatus === "invite_access" ? "PAID" : "UNPAID"}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <h4 className="font-semibold text-blue-900">Your Access Status</h4>
                                                        <p className="text-sm text-blue-700">
                                                            {subscriptionStatus === "active"
                                                                ? "Full access with your subscription"
                                                                : subscriptionStatus === "invite_access"
                                                                    ? "Full access via facility invite (paid through facility)"
                                                                    : "Limited access - subscription or invite required"}
                                                        </p>
                                                    </div>

                                                </div>
                                                {user?.facilityId && (
                                                    <div className="mt-2 text-xs text-blue-600">Connected to Facility: {user.facilityId}</div>
                                                )}
                                                {subscriptionStatus === "invite_access" && (
                                                    <div className="mt-2 text-xs text-green-600">✓ Access granted through facility invite system</div>
                                                )}
                                            </div>

                                            {/* Payment Status Display */}
                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold">Payment Details</h4>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            console.log("Manual refresh clicked");
                                                            console.log("Current user:", user);
                                                            console.log("Current subscriptionStatus:", subscriptionStatus);
                                                            console.log("Current userUsedInviteCode:", userUsedInviteCode);
                                                            fetchPaymentStatus()
                                                        }}
                                                        disabled={isLoadingPaymentStatus}
                                                        className="w-full"
                                                    >
                                                        Refresh Payment Status
                                                    </Button>
                                                </div>


                                                {isLoadingPaymentStatus ? (
                                                    <div className="flex flex-col items-center gap-2 text-gray-600">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                        <span>Loading payment status...</span>
                                                    </div>
                                                ) : isPaymentProcessing ? (
                                                    <div className="flex flex-col items-center gap-2 text-blue-600">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                        <span>Payment processing...</span>
                                                        <p className="text-xs text-gray-500">Please wait while we activate your subscription</p>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`p-4 rounded-lg border ${subscriptionStatus === "active" || subscriptionStatus === "invite_access"
                                                            ? "bg-green-50 border-green-200"
                                                            : "bg-red-50 border-red-200"
                                                            }`}
                                                    >
                                                        <div className="flex flex-col gap-2">
                                                            <span
                                                                className={`font-medium flex items-center gap-2 ${subscriptionStatus === "active" || subscriptionStatus === "invite_access"
                                                                    ? "text-green-700"
                                                                    : "text-red-700"
                                                                    }`}
                                                            >
                                                                <CreditCard
                                                                    className={`w-4 h-4 ${subscriptionStatus === "active" || subscriptionStatus === "invite_access"
                                                                        ? "text-green-600"
                                                                        : "text-red-600"
                                                                        }`}
                                                                />

                                                                {subscriptionStatus === "active"
                                                                    ? "Paid - Your Subscription"
                                                                    : subscriptionStatus === "invite_access"
                                                                        ? "Paid - Facility Invite Access"
                                                                        : subscriptionStatus === "inactive"
                                                                            ? "Unpaid - No Access"
                                                                            : "Payment Status Unknown"}
                                                            </span>
                                                        </div>
                                                        {subscriptionStatus === "active" && subscriptionDetails && (
                                                            <div className="mt-2 text-sm text-green-600">
                                                                <p>Status: {subscriptionDetails.status}</p>
                                                            </div>
                                                        )}
                                                        {subscriptionStatus === "invite_access" && (
                                                            <div className="mt-2 text-sm text-green-600 text-center">
                                                                <p>✓ Access granted through facility invite system</p>
                                                                <p>✓ You are counted as a paid user for this facility</p>
                                                                <p>✓ No additional payment required from you</p>
                                                            </div>
                                                        )}
                                                        {subscriptionStatus === "inactive" && (
                                                            <div className="mt-2 text-sm text-red-600">
                                                                <p>No active subscription or invite access</p>
                                                                <p>Subscribe on the right or ask facility for an invite code</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Information Note */}
                                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-2">How the Access System Works</h4>
                                                <div className="text-sm text-gray-600 space-y-2">
                                                    <div>
                                                        <p>
                                                            <strong>Individual Subscription:</strong>
                                                        </p>
                                                        <p>You pay monthly for your own access to the platform</p>
                                                    </div>
                                                    <div>
                                                        <p>
                                                            <strong>Facility Invite:</strong>
                                                        </p>
                                                        <p>Your facility can invite you for free access (they pay for you)</p>
                                                    </div>
                                                    <div>
                                                        <p>
                                                            <strong>Payment Status:</strong>
                                                        </p>
                                                        <p>Both methods count you as a "paid user" for the facility</p>
                                                    </div>
                                                    <div>
                                                        <p>
                                                            <strong>No Invite Sending:</strong>
                                                        </p>
                                                        <p>Family members cannot send invites to others</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side - Subscription Section */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Get Access</h3>

                                            {subscriptionStatus === "active" ? (
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-green-700" />
                                                        <span className="font-medium text-green-700">Your Active Subscription</span>
                                                    </div>
                                                    <p className="text-sm text-green-600 mt-1">
                                                        You have an active subscription. Manage your billing through your account.
                                                    </p>
                                                    {subscriptionDetails && (
                                                        <div className="mt-2 text-xs text-green-600 ">
                                                        </div>
                                                    )}
                                                </div>
                                            ) : userUsedInviteCode ? (
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex flex-col items-center gap-2 text-center">
                                                        <CreditCard className="w-4 h-4 text-green-700" />
                                                        <span className="font-medium text-green-700">Access via Facility Invite</span>
                                                    </div>
                                                    <p className="text-sm text-green-600 mt-1 text-center">
                                                        You have access through a facility invite code. No payment required from you.
                                                    </p>
                                                    <div className="mt-2 text-xs text-green-600 text-center">
                                                        <p>✓ Invite code used: {user?.usedInviteCode ? "Yes" : "No"}</p>
                                                        <p>✓ Access granted by facility</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <h4 className="font-medium text-blue-900 mb-3">Two ways to get access:</h4>
                                                        <div className="space-y-4">
                                                            <div className="p-3 bg-white rounded-lg border border-blue-100">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                                        1
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-blue-900">Subscribe Individually</p>
                                                                        <p className="text-sm text-blue-700">Pay monthly for your own access</p>
                                                                        <p className="text-sm text-blue-600 font-semibold">
                                                                            Price: ${facilityMonthlyPrice}/month
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-white rounded-lg border border-green-100">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                                        2
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-green-900">Get Facility Invite</p>
                                                                        <p className="text-sm text-green-700">Ask your facility for an invite code</p>
                                                                        <p className="text-sm text-green-600 font-semibold">Free access through facility</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={handleStartSubscription}
                                                        disabled={isLoading}
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        {isLoading ? "Processing..." : "Subscribe Now"}
                                                    </Button>
                                                </>
                                            )}

                                            {subscriptionStatus === "inactive" && <div className="flex items-center justify-center my-4">
                                                <span className="text-gray-400 text-xs uppercase">or</span>
                                            </div>}

                                            {/* Promo Code Option */}
                                            {subscriptionStatus !== "active" && !userUsedInviteCode && (
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold">Have a Discount Code?</h4>
                                                    <p className="text-xs text-gray-600">
                                                        Enter a facility discount code to get reduced pricing on your subscription
                                                    </p>
                                                    <Input
                                                        id="promoCode"
                                                        value={userPromoCode}
                                                        onChange={(e) => setUserPromoCode(e.target.value)}
                                                        placeholder="Enter discount code"
                                                        maxLength={24}
                                                    />
                                                    <Button className="w-full bg-transparent" variant="outline" onClick={handleApplyPromoCode}>
                                                        Apply Discount Code
                                                    </Button>
                                                    {promoCodeStatus && (
                                                        <p
                                                            className="text-sm mt-2"
                                                            style={{ color: promoCodeStatus === "Access Granted!" ? "green" : "red" }}
                                                        >
                                                            {promoCodeStatus}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}