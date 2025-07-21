import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, { credentials: "include" })
      .then(res => {
        if (res.status === 401) {
          router.replace("/auth/login");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        router.replace("/auth/login");
      });
  }, [router]);

  return loading;
} 