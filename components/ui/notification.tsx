"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Bell, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NotificationManagerProps {
  patientId: number
}

export function NotificationManager({ patientId }: NotificationManagerProps) {
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
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  // Check for due reminders every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        const reminderTime = new Date(reminder.scheduledTime);
        if (
          reminderTime <= now &&
          !notifiedReminders.includes(reminder.id) &&
          !reminder.isCompleted
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

  // Fetch reminders on mount
  useEffect(() => {
    fetchReminders();
  }, [patientId]);

  return (
    <div className="sticky top-4 right-4 z-50">
      <div className="relative">
        <button
          className="relative focus:outline-none bg-white rounded-full p-2 shadow-lg border"
          onClick={() => {
            setShowNotifications((prev) => !prev);
            // Mark all as seen when opening
            setNotificationList((prev) => prev.map(n => ({ ...n, seen: true })));
          }}
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {notificationList.filter(n => !n.seen).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {notificationList.filter(n => !n.seen).length}
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