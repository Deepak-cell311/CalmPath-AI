"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, Camera, MessageCircle, Bell, User, LogOut, Plus, Upload, X, Tag } from "lucide-react"
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

interface MemoryPhoto {
  id: number
  name: string
  date: string
  tags: string[]
  description: string
  url: string
  context: string
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
}

export default function FamilyDashboard() {
  const loading = useAuthRedirect();
  const [photos, setPhotos] = useState<MemoryPhoto[]>([])
  const [patientId, setPatientId] = useState<number | null>(null);

  console.log("Photos: ", photos)

  const [conversations, setConversations] = useState([
    { id: 1, date: "2024-01-15", duration: "5 min", mood: "calm", summary: "Talked about morning routine" },
    { id: 2, date: "2024-01-14", duration: "8 min", mood: "happy", summary: "Shared memories about gardening" },
  ])

  const [personalInfo, setPersonalInfo] = useState({
    work: "Retired engineer, worked on bridges and infrastructure projects.",
    family: "Wife: Mary (passed away), Children: John, Sarah. Grandchildren: Emily, David, Olivia.",
    hobbies: "Gardening (especially roses), reading historical novels, playing chess, listening to classical music.",
    food: "Shepherd's pie, apple crumble, strong black coffee.",
    other: "Loves quiet mornings, enjoys talking about his youth, can get agitated by loud noises.",
  })

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newPhoto, setNewPhoto] = useState({
    name: "",
    description: "",
    tags: "",
    context: "",
    file: null as File | null,
  })

  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    time: "",
  });

  const fetchExistingPhotos = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/memoryPhotos`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok && Array.isArray(result.data)) {
        setPhotos(result.data.map((photo: any) => ({
          id: photo.id || Date.now(),
          name: photo.photoname,
          date: new Date(photo.created_at || Date.now()).toLocaleDateString(),
          tags: photo.tags,
          description: photo.description,
          url: photo.file,
          context: photo.contextAndStory,
        })));
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  useEffect(() => {
    fetchExistingPhotos();
  }, []);

  useEffect(() => {
    if (!patientId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/medications`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMedications(data);
      })
      .catch((err) => console.error("Error fetching medications:", err));
  }, [patientId]);


  if (loading) return <div>Loading...</div>;

  const handleAddMedication = async () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.time || !patientId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newMedication),
      });
      if (res.ok) {
        const med = await res.json();
        setMedications((prev) => [...prev, med]);
        setNewMedication({ name: "", dosage: "", frequency: "", time: "" });
      }
    } catch (err) {
      console.error("Error adding medication:", err);
    }
  };

  const handleRemoveMedication = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/medications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMedications((prev) => prev.filter((med) => med.id !== id));
      }
    } catch (err) {
      console.error("Error deleting medication:", err);
    }
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setNewPhoto((prev) => ({ ...prev, file }))
    }
  }

  const handleUploadPhoto = async () => {
    if (!newPhoto.file) return;

    const formData = new FormData();
    formData.append("photo", newPhoto.file); // field name must match backend
    formData.append("photoname", newPhoto.name);
    formData.append("description", newPhoto.description);
    formData.append("tags", JSON.stringify(newPhoto.tags.split(",").map(tag => tag.trim()).filter(Boolean)));
    formData.append("contextAndStory", newPhoto.context);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/family/memoryPhotos`, {
        method: "POST",
        body: formData,
        credentials: "include", // if using session/cookie auth
      });

      const result = await response.json();
      console.log("Response: ", result)

      if (response.ok && result.data) {
        const photo = result.data;
        setPhotos((prev) => [
          ...prev,
          {
            id: Date.now(), // Generate a unique ID since the API doesn't return one
            name: photo.photoname,
            date: new Date().toLocaleDateString(), // Use current date since API doesn't return created_at
            tags: photo.tags,
            description: photo.description,
            url: photo.file,
            context: photo.contextAndStory,
          }
        ]);
        setIsUploadDialogOpen(false);
        // Reset the form
        setNewPhoto({
          name: "",
          description: "",
          tags: "",
          context: "",
          file: null,
        });
      } else {
        console.error("Upload failed:", result);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };


  const removePhoto = (photoId: number) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId))
  }

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleSavePersonalInfo = () => {
    // In a real application, you would send this data to a backend
    console.log("Saving personal info:", personalInfo)
    alert("Personal information saved!")
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CalmPath Family</h1>
              <p className="text-gray-600">Care Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-400" />
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              John Smith
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="photos">Memory Photos</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
              {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">+1 from yesterday</p>
                  </CardContent>
                </Card>
                {/* Removed Average Mood card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Memory Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{photos.length}</div>
                    <p className="text-xs text-muted-foreground">Available for recall</p>
                  </CardContent>
                </Card>
              </div>
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest interactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">Morning conversation completed</p>
                        <p className="text-sm text-gray-600">5 minutes ago • Mood: Calm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                      <Camera className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">Photo memory triggered</p>
                        <p className="text-sm text-gray-600">2 hours ago • "Family Home" shown</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Memory Photos</CardTitle>
                      <CardDescription>Upload and manage photos with context for AI memory recall</CardDescription>
                    </div>
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <DialogHeader>
                          <DialogTitle>Upload Memory Photo</DialogTitle>
                          <DialogDescription>
                            Add a photo with context and tags so the AI can show it when relevant
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="photo-file">Photo</Label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label
                                    htmlFor="photo-file"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                                  >
                                    <span>Upload a file</span>
                                    <input
                                      id="photo-file"
                                      type="file"
                                      accept="image/*"
                                      className="sr-only"
                                      onChange={handleFileUpload}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                            {newPhoto.file && (
                              <p className="mt-2 text-sm text-green-600">Selected: {newPhoto.file.name}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="photo-name">Photo Name</Label>
                            <Input
                              id="photo-name"
                              value={newPhoto.name}
                              onChange={(e) => setNewPhoto((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Family Home, Garden, Birthday Party"
                            />
                          </div>

                          <div>
                            <Label htmlFor="photo-description">Description</Label>
                            <Textarea
                              id="photo-description"
                              value={newPhoto.description}
                              onChange={(e) => setNewPhoto((prev) => ({ ...prev, description: e.target.value }))}
                              placeholder="Brief description of the photo"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label htmlFor="photo-tags">Tags (comma-separated)</Label>
                            <Input
                              id="photo-tags"
                              value={newPhoto.tags}
                              onChange={(e) => setNewPhoto((prev) => ({ ...prev, tags: e.target.value }))}
                              placeholder="home, family, garden, birthday, etc."
                            />
                            <p className="text-xs text-gray-500 mt-1">These help the AI know when to show this photo</p>
                          </div>

                          <div>
                            <Label htmlFor="photo-context">Context & Story</Label>
                            <Textarea
                              id="photo-context"
                              value={newPhoto.context}
                              onChange={(e) => setNewPhoto((prev) => ({ ...prev, context: e.target.value }))}
                              placeholder="Share the story behind this photo - what makes it special?"
                              rows={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              This context helps the AI provide meaningful conversation about the photo
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleUploadPhoto} className="flex-1">
                              Upload Photo
                            </Button>
                            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <Card key={photo.id} className="overflow-hidden">
                        <div className="aspect-video bg-gray-100 relative">
                          <img
                            src={photo.url || "/placeholder.svg"}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removePhoto(photo.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{photo.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                          <p className="text-xs text-gray-500 mb-2">{photo.date}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {photo.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                          {photo.context && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <strong>Context:</strong> {photo.context}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Medication Schedule</CardTitle>
                  <CardDescription>Manage patient's medications and schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="med-name">Medication Name</Label>
                        <Input
                          id="med-name"
                          value={newMedication.name}
                          onChange={(e) => setNewMedication((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Donepezil"
                        />
                      </div>
                      <div>
                        <Label htmlFor="med-dosage">Dosage</Label>
                        <Input
                          id="med-dosage"
                          value={newMedication.dosage}
                          onChange={(e) => setNewMedication((prev) => ({ ...prev, dosage: e.target.value }))}
                          placeholder="e.g., 5mg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="med-frequency">Frequency</Label>
                        <Input
                          id="med-frequency"
                          value={newMedication.frequency}
                          onChange={(e) => setNewMedication((prev) => ({ ...prev, frequency: e.target.value }))}
                          placeholder="e.g., Once daily"
                        />
                      </div>
                      <div>
                        <Label htmlFor="med-time">Time</Label>
                        <Input
                          id="med-time"
                          value={newMedication.time}
                          onChange={(e) => setNewMedication((prev) => ({ ...prev, time: e.target.value }))}
                          placeholder="e.g., Morning"
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddMedication} className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add Medication
                    </Button>

                    <h3 className="text-lg font-semibold mt-6 mb-3">Current Medications</h3>
                    {medications.length === 0 ? (
                      <p className="text-gray-600">No medications added yet.</p>
                    ) : (
                      <ScrollArea className="h-64 border rounded-lg p-4">
                        <div className="space-y-3">
                          {medications.map((med) => (
                            <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">
                                  {med.name} - {med.dosage}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {med.frequency} at {med.time}
                                </p>
                              </div>
                              <Button variant="destructive" size="sm" onClick={() => handleRemoveMedication(med.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal-info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Personal Information</CardTitle>
                  <CardDescription>
                    Provide details about the patient to help the AI personalize conversations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="work-history">Work History / Career</Label>
                    <Textarea
                      id="work-history"
                      value={personalInfo.work}
                      onChange={(e) => handlePersonalInfoChange("work", e.target.value)}
                      placeholder="e.g., Retired teacher, worked for 30 years at Lincoln High School."
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">What kind of work did the patient do?</p>
                  </div>
                  <div>
                    <Label htmlFor="family-names">Family Members & Relationships</Label>
                    <Textarea
                      id="family-names"
                      value={personalInfo.family}
                      onChange={(e) => handlePersonalInfoChange("family", e.target.value)}
                      placeholder="e.g., Spouse: Jane, Children: Mark, Lisa. Grandchildren: Alex, Sarah."
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Names of important family members and their relation.</p>
                  </div>
                  <div>
                    <Label htmlFor="hobbies">Hobbies & Interests</Label>
                    <Textarea
                      id="hobbies"
                      value={personalInfo.hobbies}
                      onChange={(e) => handlePersonalInfoChange("hobbies", e.target.value)}
                      placeholder="e.g., Painting, gardening, playing golf, listening to jazz music."
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">What does the patient enjoy doing?</p>
                  </div>
                  <div>
                    <Label htmlFor="favorite-foods">Favorite Foods</Label>
                    <Textarea
                      id="favorite-foods"
                      value={personalInfo.food}
                      onChange={(e) => handlePersonalInfoChange("food", e.target.value)}
                      placeholder="e.g., Apple pie, roast chicken, mashed potatoes."
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">Foods that bring comfort or good memories.</p>
                  </div>
                  <div>
                    <Label htmlFor="other-details">Other Important Details</Label>
                    <Textarea
                      id="other-details"
                      value={personalInfo.other}
                      onChange={(e) => handlePersonalInfoChange("other", e.target.value)}
                      placeholder="e.g., Loves animals, has a pet cat named Whiskers, enjoys quiet environments."
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">Any other details that help personalize interaction.</p>
                  </div>
                  <Button onClick={handleSavePersonalInfo} className="w-full">
                    Save Personal Info
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="conversations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation History</CardTitle>
                  <CardDescription>Review past interactions and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {conversations.map((conv) => (
                        <div key={conv.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{conv.date}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{conv.duration}</span>
                              <span
                                className={`px-2 py-1 text-xs rounded ${conv.mood === "calm"
                                    ? "bg-green-100 text-green-800"
                                    : conv.mood === "happy"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {conv.mood}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700">{conv.summary}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent> */}

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily Summary</Label>
                      <p className="text-sm text-gray-600">Receive daily activity summaries</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Photo Memory Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified when photos are shown to patient</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Emergency Alerts</Label>
                      <p className="text-sm text-gray-600">Immediate notifications for urgent situations</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
