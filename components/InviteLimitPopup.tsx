import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, CreditCard } from "lucide-react";

interface InviteLimitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  limits: {
    totalPurchased: number;
    usedInvites: number;
    remainingInvites: number;
  };
  onUpgrade: () => void;
}

export function InviteLimitPopup({ isOpen, onClose, limits, onUpgrade }: InviteLimitPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Invitation Limit Reached
          </DialogTitle>
          <DialogDescription>
            You have reached your invitation limit. Here's your current usage:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{limits.totalPurchased}</div>
              <div className="text-sm text-blue-600">Total Purchased</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{limits.usedInvites}</div>
              <div className="text-sm text-green-600">Used</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{limits.remainingInvites}</div>
              <div className="text-sm text-red-600">Remaining</div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Need More Invites?</h4>
                <p className="text-sm text-amber-700 mt-1">
                  You've used all your purchased invites. Purchase more to continue inviting patients.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={onUpgrade} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Purchase More Invites
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
