import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Or 'next/router' if using Pages Router

export function useAuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Set to true initially while checking auth

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
          credentials: "include" // Essential for sending cookies
        });

        if (res.status === 401) {
          console.error("Authentication required, redirecting to login.");
          router.replace("/auth/login"); // Redirect to login if unauthenticated
        } else if (!res.ok) {
          // Handle other non-200 responses if necessary
          console.error("Backend error during auth check:", res.status);
          router.replace("/auth/login");
        } else {
          // User is authenticated, no redirect needed
          setLoading(false);
        }
      } catch (error) {
        console.error("Error during authentication check:", error);
        router.replace("/auth/login"); // Redirect on network errors or other issues
      }
    };

    checkAuth();
  }, [router]);

  return loading; // Return loading state to potentially show a loader on protected pages
}