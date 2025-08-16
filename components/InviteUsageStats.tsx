import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useInviteLimits } from '@/hooks/useInviteLimits';

export function InviteUsageStats() {
  const { limits, loading, error } = useInviteLimits();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !limits) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Invite Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load invite usage data</p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = limits.totalPurchased > 0 
    ? Math.round((limits.usedInvites / limits.totalPurchased) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invite Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Usage Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage Progress</span>
              <span>{usagePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  usagePercentage >= 90 ? 'bg-red-500' : 
                  usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{limits.totalPurchased}</div>
              <div className="text-xs text-gray-600">Total Purchased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{limits.usedInvites}</div>
              <div className="text-xs text-gray-600">Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{limits.remainingInvites}</div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2">
            {limits.hasAnyPurchases ? (
              limits.canInvite ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">You can invite {limits.remainingInvites} more patients</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Invitation limit reached</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">No invites purchased yet</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
