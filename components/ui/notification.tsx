"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Bell, CheckCircle } from "lucide-react"

interface NotificationProps {
  message: string
  scheduledTime: string
  reminderId: number
  onDismiss: (reminderId: number) => void
  onComplete: (reminderId: number) => void
}

export function Notification({ message, scheduledTime, reminderId, onDismiss, onComplete }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(reminderId), 300) // Allow animation to complete
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => onComplete(reminderId), 300) // Allow animation to complete
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 animate-in slide-in-from-bottom-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Reminder</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {new Date(scheduledTime).toLocaleString()}
            </p>
            <p className="text-base">{message}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleComplete}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface NotificationManagerProps {
  patientId: number
}

export function NotificationManager({ patientId }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const checkForReminders = async () => {
    if (isChecking) return
    setIsChecking(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/reminders/active`)
      if (response.ok) {
        const reminders = await response.json()
        const now = new Date()
        
        // Filter reminders that are due (within 5 minutes of scheduled time)
        const dueReminders = reminders.filter((reminder: any) => {
          const scheduledTime = new Date(reminder.scheduledTime)
          const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime())
          const fiveMinutes = 5 * 60 * 1000
          return timeDiff <= fiveMinutes && !reminder.isCompleted
        })

        // Add new notifications
        setNotifications(prev => {
          const existingIds = prev.map(n => n.id)
          const newNotifications = dueReminders.filter((r: any) => !existingIds.includes(r.id))
          return [...prev, ...newNotifications]
        })
      }
    } catch (error) {
      console.error("Error checking reminders:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleDismissNotification = (reminderId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== reminderId))
  }

  const handleCompleteNotification = async (reminderId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reminders/${reminderId}/complete`, {
        method: "POST",
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== reminderId))
      }
    } catch (error) {
      console.error("Error completing reminder:", error)
    }
  }

  // Check for reminders every minute
  useEffect(() => {
    const interval = setInterval(checkForReminders, 60000) // Check every minute
    checkForReminders() // Check immediately on mount

    return () => clearInterval(interval)
  }, [patientId])

  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          scheduledTime={notification.scheduledTime}
          reminderId={notification.id}
          onDismiss={handleDismissNotification}
          onComplete={handleCompleteNotification}
        />
      ))}
    </>
  )
} 