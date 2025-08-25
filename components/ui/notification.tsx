"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Bell, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NotificationManagerProps {
  patientId: number
  isVoiceChatActive?: boolean
}

export function NotificationManager({ patientId, isVoiceChatActive = false }: NotificationManagerProps) {
  const [notifiedReminders, setNotifiedReminders] = useState<number[]>([]);
  const [notificationList, setNotificationList] = useState<{id: number, message: string, time: string, seen: boolean}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/reminders`);
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      } else {
        console.error("NotificationManager: Failed to fetch reminders:", response.status);
      }
    } catch (error) {
      console.error("NotificationManager: Error fetching reminders:", error);
    }
  };

  // Check for due reminders every 30 seconds (less frequent to avoid interference)
  useEffect(() => {
    // Don't check reminders if voice chat is active to avoid interference
    if (isVoiceChatActive) {
      return;
    }
    
    const interval = setInterval(() => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        const reminderTime = new Date(reminder.scheduledTime);
        
        if (
          reminderTime <= now &&
          !notifiedReminders.includes(reminder.id) &&
          !reminder.isCompleted
        ) {
          console.log("NotificationManager: Triggering notification for reminder", reminder.id);
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
    }, 30000); // Changed from 1000ms to 30000ms (30 seconds)
    return () => clearInterval(interval);
  }, [reminders, notifiedReminders, isVoiceChatActive]);

  // Fetch reminders on mount and periodically
  useEffect(() => {
    // Don't fetch reminders if voice chat is active to avoid interference
    if (isVoiceChatActive) {
      return;
    }
    
    fetchReminders();
    
    // Refresh reminders every 2 minutes to ensure we have the latest data (less frequent)
    const refreshInterval = setInterval(() => {
      fetchReminders();
    }, 120000); // Changed from 30000ms to 120000ms (2 minutes)
    
    return () => clearInterval(refreshInterval);
  }, [patientId, isVoiceChatActive]);

  return (
    <div className="sticky top-4 right-4 z-50">
      <div className="relative">
        <button
          className={`relative focus:outline-none rounded-full p-2 shadow-lg border ${
            isVoiceChatActive ? 'bg-gray-100' : 'bg-white'
          }`}
          onClick={() => {
            setShowNotifications((prev) => !prev);
            // Mark all as seen when opening
            setNotificationList((prev) => prev.map(n => ({ ...n, seen: true })));
          }}
          title={isVoiceChatActive ? "Notifications paused during voice chat" : "Notifications"}
        >
          <Bell className={`w-5 h-5 ${isVoiceChatActive ? 'text-gray-400' : 'text-gray-600'}`} />
          {notificationList.filter(n => !n.seen).length > 0 && !isVoiceChatActive && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {notificationList.filter(n => !n.seen).length}
            </span>
          )}
          {isVoiceChatActive && (
            <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs rounded-full px-1.5 py-0.5">
              ⏸️
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold text-gray-600">Notifications</span>
              <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                &#10005;
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {isVoiceChatActive && (
                <div className="p-4 text-gray-500 text-center bg-gray-50 border-b">
                  <div className="text-sm">⏸️ Notifications paused during voice chat</div>
                </div>
              )}
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
    </div>
  )
} 