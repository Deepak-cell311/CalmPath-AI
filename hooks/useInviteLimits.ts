import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth';

interface InviteLimits {
  totalPurchased: number;
  usedInvites: number;
  availableInvites: number;
  canInvite: boolean;
  limitReached: boolean;
  hasAnyPurchases: boolean;
  remainingInvites: number;
}

export function useInviteLimits() {
  const [limits, setLimits] = useState<InviteLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInviteLimits = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authClient.getToken();
      if (!token) {
        setError('No authentication token');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facility/invite-limits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch invite limits: ${response.status}`);
      }

      const data = await response.json();
      setLimits(data);
    } catch (err) {
      console.error('Error fetching invite limits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invite limits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInviteLimits();
  }, []);

  const refreshLimits = () => {
    fetchInviteLimits();
  };

  return {
    limits,
    loading,
    error,
    refreshLimits
  };
}
