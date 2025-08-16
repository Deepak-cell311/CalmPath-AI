import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Users, ArrowUp } from "lucide-react";

interface UpgradeInviteButtonProps {
  onClick: () => void;
  className?: string;
}

export function UpgradeInviteButton({ onClick, className = "" }: UpgradeInviteButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          <Users className="h-4 w-4" />
        </div>
        <span>Upgrade for Invites</span>
        <ArrowUp className="h-4 w-4" />
      </div>
    </Button>
  );
}
