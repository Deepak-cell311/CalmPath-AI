import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Or 'next/router' if using Pages Router

export function useAuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Set to true initially while checking auth

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("useAuthRedirect: Checking authentication");
        console.log("useAuthRedirect: localStorage available:", typeof window !== 'undefined' && !!window.localStorage);
        
        if (typeof window !== 'undefined') {
          console.log("useAuthRedirect: All localStorage keys:", Object.keys(localStorage));
          console.log("useAuthRedirect: localStorage length:", localStorage.length);
          console.log("useAuthRedirect: localStorage quota exceeded:", localStorage.getItem('authToken') === null && localStorage.length > 0);
          
          // Check if there are any other auth-related keys
          const authKeys = Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('token') || key.includes('user'));
          console.log("useAuthRedirect: Auth-related localStorage keys:", authKeys);
        }
        
        const token = localStorage.getItem('authToken');
        console.log("useAuthRedirect: Token from localStorage:", token ? token.substring(0, 20) + "..." : "null");
        
        if (!token) {
          console.error("useAuthRedirect: No auth token found, redirecting to login.");
          router.replace("/auth/login");
          return;
        }

        // Try to decode the token to see if it's valid
        try {
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
          console.log("useAuthRedirect: Token decoded successfully:", decoded);
          console.log("useAuthRedirect: Token contains userId:", !!decoded.userId);
          console.log("useAuthRedirect: Token contains email:", !!decoded.email);
          console.log("useAuthRedirect: Token contains timestamp:", !!decoded.timestamp);
          
          // Check if the token has the expected structure
          if (!decoded.userId || !decoded.email || !decoded.timestamp) {
            console.error("useAuthRedirect: Token missing required fields, redirecting to login");
            localStorage.removeItem('authToken');
            router.replace("/auth/login");
            return;
          }
          
          // Check if the timestamp is reasonable (not too old or in the future)
          const tokenTime = new Date(decoded.timestamp);
          const now = new Date();
          const timeDiff = Math.abs(now.getTime() - tokenTime.getTime());
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (timeDiff > maxAge) {
            console.error("useAuthRedirect: Token too old or in the future, redirecting to login");
            console.log("useAuthRedirect: Token time:", tokenTime.toISOString());
            console.log("useAuthRedirect: Current time:", now.toISOString());
            console.log("useAuthRedirect: Time difference (ms):", timeDiff);
            localStorage.removeItem('authToken');
            router.replace("/auth/login");
            return;
          }
          
          console.log("useAuthRedirect: Token validation passed, proceeding with auth check");
        } catch (error) {
          console.error("useAuthRedirect: Error decoding token:", error);
          console.log("useAuthRedirect: Token appears to be corrupted, redirecting to login");
          localStorage.removeItem('authToken');
          router.replace("/auth/login");
          return;
        }

        console.log("useAuthRedirect: Checking authentication with token:", token.substring(0, 20) + "...");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user-token`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("useAuthRedirect: Auth check response status:", res.status);
        console.log("useAuthRedirect: Auth check response headers:", Object.fromEntries(res.headers.entries()));

        if (res.status === 401) {
          console.error("useAuthRedirect: Authentication required, redirecting to login.");
          localStorage.removeItem('authToken'); // Clear invalid token
          router.replace("/auth/login"); // Redirect to login if unauthenticated
        } else if (!res.ok) {
          // Handle other non-200 responses if necessary
          console.error("useAuthRedirect: Backend error during auth check:", res.status);
          router.replace("/auth/login");
        } else {
          // User is authenticated, no redirect needed
          console.log("useAuthRedirect: User authenticated successfully");
          setLoading(false);
        }
      } catch (error) {
        console.error("useAuthRedirect: Error during authentication check:", error);
        router.replace("/auth/login"); // Redirect on network errors or other issues
      }
    };

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return loading; // Return loading state to potentially show a loader on protected pages
}