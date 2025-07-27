"use client"

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Users, Activity, Calendar, CheckCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function FacilityDashboard() {
  const loading = useAuthRedirect();
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [status, setStatus] = useState({
    totalPatients: 0,
    activeSessions: 0,
    scheduledCheckins: 0,
    systemStatus: "Online",
  });
  const [patients, setPatients] = useState<any[]>([]);
  const fetchDashboardData = async () => {
    try {
      const [patientsRes, statusRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients`, { 
          // credentials: "include" 
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/status-counts`, { 
          // credentials: "include" 
        }),
      ]);
  
      const patientsData = await patientsRes.json();
      const statusData = await statusRes.json();
  
      const active = statusData.find((d: any) => d.status === "ok" || d.status === "good");
  
      setPatients(patientsData);
      setStatus(s => ({
        ...s,
        totalPatients: patientsData.length,
        activeSessions: active ? active.count : 0,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };
  

  useEffect(() => {
    if (!loading) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients`, { 
        // credentials: "include" 
      })
        .then(res => res.json())
        .then(data => {
          setStatus(s => ({ ...s, totalPatients: data.length }));
          setPatients(data);
        });
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/status-counts`, { 
        // credentials: "include" 
      })
        .then(res => res.json())
        .then(data => {
          const active = data.find((d: any) => d.status === "ok" || d.status === "good");
          setStatus(s => ({ ...s, activeSessions: active ? active.count : 0 }));
        });
      fetchDashboardData();
    }
  }, [loading]);

  if (loading) return <div>Loading...</div>;

  const statusCards = [
    { title: "Total Patients", value: status.totalPatients, icon: Users, color: "text-blue-600" },
    { title: "Active Sessions", value: status.activeSessions, icon: Activity, color: "text-green-600" },
    // { title: "Scheduled Check-ins", value: status.scheduledCheckins, icon: Calendar, color: "text-yellow-600" },
    // { title: "System Status", value: status.systemStatus, icon: CheckCircle, color: "text-green-600" },
  ];

  const handleRefresh = () => {
    fetchDashboardData();
    setLastUpdated("Just now");
    // Optionally, re-fetch data here
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Facility Dashboard</h1>
              <p className="text-gray-600">Patient care management system</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {statusCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Patient Activity Monitor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patient Activity Monitor</CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Offline</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-600 mb-4">No patients are currently registered in the system.</p>
                <Button asChild>
                  <a href="/dashboard/patients">Manage Patients</a>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 whitespace-nowrap">{p.firstName} {p.lastName}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{p.status}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{p.roomNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
