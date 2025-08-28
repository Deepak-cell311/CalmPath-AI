"use client"

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Users, Activity, Calendar, CheckCircle, Loader2, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { InviteUsageStats } from "@/components/InviteUsageStats";

export default function FacilityDashboard() {
  const loading = useAuthRedirect();
  const { user } = useAuth()
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [status, setStatus] = useState({
    totalPatients: 0,
    activeSessions: 0,
    scheduledCheckins: 0,
    systemStatus: "Online",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);


  const fetchDashboardData = async () => {
    setIsLoading(true); // Start loading
    try {
      // Use different endpoints based on user type
      let patientsUrl;
      if (user?.accountType === "Facility Staff" && user?.facilityId) {
        // For facility staff, get all members (patients + invited family members)
        patientsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/facility/members?facilityId=${user.facilityId}`;
      } else {
        // For individual users, get their patients
        patientsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/patients?userId=${user?.id}`;
      }

      const [patientsRes, statusRes] = await Promise.all([
        fetch(patientsUrl, {
          credentials: "include"
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/status-counts?${user?.accountType === "Facility Staff" && user?.facilityId ? `facilityId=${user.facilityId}` : `userId=${user?.id}`}`, {
          credentials: "include"
        }),
      ]);

      const patientsData = await patientsRes.json();
      const statusData = await statusRes.json();

      console.log("User: ", user)
      console.log(`Patients Response is:  ${patientsRes} and Patients Data is: ${patientsData}`)

      const active = statusData.find((d: any) => d.status === "ok" || d.status === "good");

      // For facility staff, data is already filtered by facility
      // For individual users, filter by userId
      let filtered = patientsData;
      if (user?.accountType !== "Facility Staff") {
        filtered = patientsData.filter((p: any) => p.userId === user?.id);
      }

      setPatients(patientsData);
      setFilteredPatients(filtered);
      setStatus(s => ({
        ...s,
        totalPatients: filtered.length, // only count relevant patients
        activeSessions: active ? active.count : 0,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // If user id and patient id will be matched after that it will be shown into the frontend
  useEffect(() => {
    if (patients.length > 0 && user) {
      let filtered;
      if (user.accountType === "Facility Staff") {
        // For facility staff, patients are already filtered by facilityId from the API
        filtered = patients;
      } else {
        // For individual users, filter by userId
        filtered = patients.filter((patient) => patient.userId === user.id);
      }
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]); // fallback when no patients
    }
  }, [patients, user]);

  // 👇 Instead of using all patients for the status,
  // filter them first by the logged-in user
  useEffect(() => {
    if (!loading && user) {
      setIsLoading(true);
      // Use different endpoints based on user type
      let patientsUrl;
      if (user.accountType === "Facility Staff" && user.facilityId) {
        // For facility staff, get all members (patients + invited family members)
        patientsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/facility/members?facilityId=${user.facilityId}`;
      } else {
        // For individual users, get their patients
        patientsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/patients?userId=${user.id}`;
      }

      Promise.all([
        fetch(patientsUrl, {
          credentials: "include"
        }).then(res => res.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/status-counts?${user?.accountType === "Facility Staff" && user?.facilityId ? `facilityId=${user.facilityId}` : `userId=${user?.id}`}`, {
          credentials: "include"
        }).then(res => res.json())
      ])
        .then(([patientsData, statusData]) => {
          // For facility staff, data is already filtered by facility
          // For individual users, filter by userId
          let filtered = patientsData;
          if (user.accountType !== "Facility Staff") {
            filtered = patientsData.filter((p: any) => p.userId === user.id);
          }

          setPatients(patientsData);
          setFilteredPatients(filtered);

          // Update counts consistently
          setStatus(s => ({
            ...s,
            totalPatients: filtered.length, // only count relevant patients
            activeSessions: statusData.find((d: any) => d.status === "ok" || d.status === "good")?.count || 0,
          }));
        })
        .catch((error) => {
          console.error("Error fetching dashboard data:", error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [loading, user]);


  if (loading) return <div>Loading...</div>;

  const statusCards = [
    { title: "Total Patients", value: status.totalPatients, icon: Users, color: "text-blue-600" },
    { title: "Active Sessions", value: status.activeSessions, icon: Activity, color: "text-green-600" },
  ];

  const handleRefresh = () => {
    fetchDashboardData();
    setLastUpdated("Just now");
    window.location.reload();
  };

  return (
    <>
      {/* Mobile-Friendly Header */}
      <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block">
              <SidebarTrigger />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Facility Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600">Patient care management system</p>
            </div>
          </div>
          
          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-500">Last updated: {lastUpdated}</div>
              <Button 
                onClick={() => {
                  handleRefresh();
                  setShowMobileMenu(false);
                }} 
                className="flex items-center gap-2 w-full justify-start"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* Status Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statusCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {isLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400" /> : card.value}
                    </p>
                  </div>
                  <card.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Invite Usage Statistics */}
        {/* <div className="mb-8">
          <InviteUsageStats />
        </div> */}

        {/* Patient Activity Monitor */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl">Patient Activity Monitor</CardTitle>
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded-full"></div>
                  <span>Offline</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 sm:py-12">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400 mx-auto mb-4" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                <p className="text-sm text-gray-600 mb-4">No patients are currently registered in the system.</p>
                <Button asChild>
                  <a href="/dashboard/patients">Manage Patients</a>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="hidden sm:table min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 whitespace-nowrap">{p.firstName} {p.lastName}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            p.type === 'family_member' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {p.type === 'family_member' ? 'Family Member' : 'Patient'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{p.status}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{p.roomNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {filteredPatients.map((p) => (
                    <Card key={p.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{p.firstName} {p.lastName}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            p.type === 'family_member' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {p.type === 'family_member' ? 'Family Member' : 'Patient'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Status: {p.status}</span>
                          <span>Room: {p.roomNumber || '-'}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}