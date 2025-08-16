"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Users, Plus, Mail, Phone, Calendar, Edit, Trash2, Loader2, PhoneCall, Loader2Icon } from "lucide-react"
import { usePatients } from "@/hooks/usePatients"
import { toast } from "sonner"
import { SmartInviteButton } from "@/components/SmartInviteButton"
import { InviteUsageStats } from "@/components/InviteUsageStats"

export default function PatientManagement() {

  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<any[]>([]);
  const [filterUserId, setFilterUserId] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    care_level: "low" as 'low' | 'medium' | 'high',
    roomNumber: "",
    medicalNotes: "",
    emergencyContact: "",
    emergencyPhone: "",
    message: "",
  })

  // Use the custom hook for patient management
  const {
    patients: hookPatients,
    stats,
    loading,
    error,
    createPatient,
    deletePatient,
    updatePatientStatus
  } = usePatients(user?.facilityId)

  const handleInvitePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const success = await createPatient({
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        email: inviteForm.email,
        phone: inviteForm.phone || undefined,
        age: inviteForm.age ? parseInt(inviteForm.age) : undefined,
        care_level: inviteForm.care_level,
        roomNumber: inviteForm.roomNumber || undefined,
        medicalNotes: inviteForm.medicalNotes || undefined,
        emergencyContact: inviteForm.emergencyContact || undefined,
        emergencyPhone: inviteForm.emergencyPhone || undefined,
        message: inviteForm.message || undefined,
      })

      if (success) {
        toast.success("Patient invitation sent successfully!")
        setInviteForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          age: "",
          care_level: "low",
          roomNumber: "",
          medicalNotes: "",
          emergencyContact: "",
          emergencyPhone: "",
          message: ""
        })
        setIsInviteDialogOpen(false);
        await fetchPatients();
      } else {
        toast.error("Failed to send invitation. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred while sending the invitation.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePatient = async (id: string) => {
    try {
      const success = await deletePatient(id)
      if (success) {
        toast.success("Patient deleted successfully!")
        await fetchPatients();
      } else {
        toast.error("Failed to delete patient. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the patient.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100"
      case "Invited":
        return "text-yellow-600 bg-yellow-100"
      case "Inactive":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const fetchPatients = async (userId?: string) => {
    setIsLoading(true);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/patients`);
      if (userId) {
        url.searchParams.append('userId', userId);
      }

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const patientsData = await res.json();
      setPatients(patientsData);
      console.log("Fetched patients:", patientsData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients()
  }, [])

  // If user id and patient id will be matched after that it will be shown into the frontend
  useEffect(() => {
    if (patients.length && user?.id) {
      const filtered = patients.filter(patient => patient.userId === user.id);
      setFilteredPatients(filtered);
      console.log("Filtered patients:", filtered);
    }
  }, [patients, user]);

  // useEffect(() => {
  //   if (filterUserId.trim() === "") {
  //     setFilteredPatients(patients);
  //   } else {
  //     const filtered = patients.filter(patient => 
  //       patient.userId && patient.userId.toLowerCase().includes(filterUserId.toLowerCase())
  //     );
  //     setFilteredPatients(filtered);
  //   }
  // }, [patients, filterUserId]);


  // Console log 
  console.log("User: ", user)
  console.log("Patient: ", patients)
  console.log("Filtered Patients: ", filteredPatients)


  return (
    <>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-600">Invite and manage patients in your facility</p>
            </div>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <SmartInviteButton 
                onInvite={() => setIsInviteDialogOpen(true)}
                onUpgrade={() => window.location.href = '/dashboard/settings'}
                className="flex items-center gap-2"
              >
                {/* <Plus className="w-4 h-4" /> */}
                Invite Patient
              </SmartInviteButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Invite New Patient</DialogTitle>
                <DialogDescription>
                  Send an invitation to a patient to join CalmPath through your facility.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvitePatient} className="space-y-4 h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={inviteForm.firstName}
                      onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={inviteForm.lastName}
                      onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="patient@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={inviteForm.phone}
                      onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={inviteForm.age}
                      onChange={(e) => setInviteForm({ ...inviteForm, age: e.target.value })}
                      placeholder="65"
                      min="0"
                      max="120"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={inviteForm.roomNumber}
                      onChange={(e) => setInviteForm({ ...inviteForm, roomNumber: e.target.value })}
                      placeholder="101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="care_level">Care Level</Label>
                    <select
                      id="care_level"
                      value={inviteForm.care_level}
                      onChange={(e) => setInviteForm({ ...inviteForm, care_level: e.target.value as 'low' | 'medium' | 'high' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={inviteForm.emergencyContact}
                      onChange={(e) => setInviteForm({ ...inviteForm, emergencyContact: e.target.value })}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={inviteForm.emergencyPhone}
                      onChange={(e) => setInviteForm({ ...inviteForm, emergencyPhone: e.target.value })}
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalNotes">Medical Notes</Label>
                  <Textarea
                    id="medicalNotes"
                    value={inviteForm.medicalNotes}
                    onChange={(e) => setInviteForm({ ...inviteForm, medicalNotes: e.target.value })}
                    placeholder="Any relevant medical information..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    placeholder="Add a personal message to the invitation..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Invitation'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : (
                      stats?.total || filteredPatients?.length
                    )}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Patients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : (
                      stats?.active ?? (Array.isArray(patients) ? patients.filter((p) => p && p.status === "Active").length : 0)
                    )}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Invites</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : (
                      stats?.invited ?? (Array.isArray(patients) ? patients.filter((p) => p && p.status === "Invited").length : 0)
                    )}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Usage Statistics */}
        {/* <div className="mb-8">
          <InviteUsageStats />
        </div> */}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients yet</h3>
                <p className="text-gray-600 mb-4">Start by inviting your first patient to join CalmPath.</p>
                {/* <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Patient
                </Button> */}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {/* <TableHead>User ID</TableHead> */}
                    <TableHead>Contact</TableHead>
                    <TableHead>Age/Room</TableHead>
                    <TableHead>Care Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </TableCell>
                      {/* <TableCell>
                        <span className="text-sm text-gray-600 font-mono">
                          {patient.userId || 'N/A'}
                        </span>
                      </TableCell> */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <PhoneCall className="w-3 h-3" />
                            {patient.emergencyPhone || 'N/A'}
                          </div>
                          {patient.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {patient.emergencyPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {patient.age ? `${patient.age} years` : 'N/A'}
                          {patient.roomNumber && (
                            <div className="text-xs text-gray-500">
                              Room {patient.roomNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.care_level === 'high' ? 'bg-red-100 text-red-800' :
                          patient.care_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {patient.care_level || 'low'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status || 'Inactive')}`}
                        >
                          {patient.status || 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{patient.lastInteraction ? new Date(patient.lastInteraction).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePatient(patient.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}