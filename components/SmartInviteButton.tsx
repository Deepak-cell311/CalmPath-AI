import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useInviteLimits } from '@/hooks/useInviteLimits';
import { InviteLimitPopup } from './InviteLimitPopup';
import { UpgradeInviteButton } from './UpgradeInviteButton';

interface SmartInviteButtonProps {
  onInvite: () => void;
  onUpgrade: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function SmartInviteButton({ onInvite, onUpgrade, className = "", children }: SmartInviteButtonProps) {
  const { limits, loading } = useInviteLimits();
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  if (loading) {
    return (
      <Button disabled className={`opacity-50 ${className}`}>
        <Users className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  // If no purchases, show upgrade button
  if (!limits?.hasAnyPurchases) {
    return (
      <UpgradeInviteButton onClick={onUpgrade} className={className} />
    );
  }

  // If limit reached, show disabled button with limit popup
  if (limits?.limitReached) {
    return (
      <>
        <Button 
          disabled 
          onClick={() => setShowLimitPopup(true)}
          className={`bg-gray-400 hover:bg-gray-400 cursor-not-allowed ${className}`}
        >
          <Users className="h-4 w-4 mr-2" />
          Invite Limit Reached
        </Button>
        
        <InviteLimitPopup
          isOpen={showLimitPopup}
          onClose={() => setShowLimitPopup(false)}
          limits={{
            totalPurchased: limits.totalPurchased,
            usedInvites: limits.usedInvites,
            remainingInvites: limits.remainingInvites
          }}
          onUpgrade={onUpgrade}
        />
      </>
    );
  }

  // If can invite, show normal invite button
  if (limits?.canInvite) {
    return (
      <Button onClick={onInvite} className={`bg-blue-600 hover:bg-blue-700 ${className}`}>
        <Plus className="h-4 w-4 mr-2" />
        {children || "Invite Patient"}
      </Button>
    );
  }

  // Fallback: show upgrade button
  return (
    <UpgradeInviteButton onClick={onUpgrade} className={className} />
  );
}
