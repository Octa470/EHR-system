import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  FileTextIcon,
  UsersIcon,
  AlertCircleIcon,
  PillIcon,
  BarChartIcon,
  ClipboardIcon,
  Download,
} from "lucide-react";
import Navbar from "@/components/pages/Navbar";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/pages/Footer";

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [recentPatients, setRecentPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  useEffect(() => {
    if (user && !loading) {
      fetchDashboardData();
    }
  }, [user, loading]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      if (user.role === "doctor") {
        const patientsRes = await fetch("/api/doctor/patients", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          setRecentPatients(patientsData.patient.patients || []);
        }
      }

      try {
        const response = await fetch("/api/appointments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);

        if (user.role === "patient") {
          const now = new Date();
          const upcoming = data.filter((apt) => new Date(apt.date) >= now);
          setUpcomingAppointments(upcoming);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }

      if (user.role === "patient" && user.doctor) {
        const doctorsRes = await fetch("/api/doctors", {
          method: "GET"
        });
        if (doctorsRes.ok) {
          const allDoctors = await doctorsRes.json();
          const foundDoc = allDoctors.find((doc) => doc._id === user.doctor._id);
          if (foundDoc) setAssignedDoctor(foundDoc);
        }
      }

      if (user.role === "patient") {
        await fetchPrescriptions();
        await fetchMedicalRecords();
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch(`/api/prescription/${user._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch prescriptions.");
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const res = await fetch("/api/medicalRecords/my-records", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch medical records.");
      setMedicalRecords(data);
    } catch (err) {
      console.error("Error fetching medical records:", err);
      setError(err.message);
    }
  };

  const fetchPrescriptionPdf = async () => {
    try {
      const res = await fetch(`/api/prescription/pdf/${prescriptions[0]._id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/pdf",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prescription.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download prescription PDF");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <AlertCircleIcon className="text-red-500 h-12 w-12 mb-4" />
        <h1 className="text-xl font-medium mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-4">
          You are not authenticated or your session has expired.
        </p>
        <Button onClick={() => navigate("/login")}>Return to Login</Button>
      </div>
    );
  }

  const firstName = user.name.split(" ")[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (dateString) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentDate = formatDate(new Date());

  const renderDoctorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-4">
                <UsersIcon className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Patients
                </p>
                <h3 className="text-2xl font-bold">
                  {user.patients?.length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-4">
                <CalendarIcon className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Today's Appointments
                </p>
                <h3 className="text-2xl font-bold">
                  {appointments.filter(
                    (apt) =>
                      new Date(apt.date).toDateString() ===
                      new Date().toDateString()
                  ).length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <Progress value={66} className="bg-gray-200 w-48" />
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                        {appointment.patientId?.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {appointment.patientId?.name || "Patient"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.date)} • {appointment.time}
                          {appointment.type && ` • ${appointment.type}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/appointments/${appointment._id}`)
                      }
                      variant="outline"
                    >
                      View
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate("/appointments")}
                >
                  View All Appointments
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Button onClick={() => navigate("/appointments")}>
                  Schedule Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-5 w-5" />
              Recent Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <Progress value={66} className="bg-gray-200 w-48" />
              </div>
            ) : recentPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPatients.map((patient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700 mr-3">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => navigate(`/patients/${patient._id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No patients yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderPatientDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full mr-4">
                <CalendarIcon className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Upcoming Appointments
                </p>
                <h3 className="text-2xl font-bold">
                  {upcomingAppointments?.length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full mr-4">
                <PillIcon className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Prescriptions
                </p>
                <h3 className="text-2xl font-bold">
                  {prescriptions?.length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-4">
                <FileTextIcon className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Medical Records
                </p>
                <h3 className="text-2xl font-bold">
                  {medicalRecords?.length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <Progress value={66} className="bg-gray-200 w-48" />
              </div>
            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
                        {appointment.doctorId?.name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <p className="font-medium">
                          Dr. {appointment.doctorId?.name || "Doctor"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.date)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.time}
                          {appointment.type && ` • ${appointment.type}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/appointments`)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate("/appointments")}
                >
                  View All Appointments
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Button onClick={() => navigate("/appointments")}>
                  Schedule an Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        {user.doctor ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="mr-2 h-5 w-5" />
                Your Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 mb-3">
                  {assignedDoctor?.name?.charAt(0) || "D"}
                </div>
                <h3 className="text-lg font-medium">
                  {assignedDoctor?.name
                    ? `Dr. ${assignedDoctor.name}`
                    : "Your Doctor"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {assignedDoctor?.specialty || "General Practitioner"}
                </p>
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => navigate("/appointments")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="mr-2 h-5 w-5" />
                Doctor Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">
                  You haven't chosen a doctor yet
                </p>
                <Button onClick={() => navigate("/doctor")}>
                  Choose a Doctor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PillIcon className="mr-2 h-5 w-5" />
              Current Prescription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <Progress value={66} className="bg-gray-200 w-48" />
              </div>
            ) : prescriptions && prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                Prescription ID {prescriptions[0]._id}
                <Button onClick={fetchPrescriptionPdf}>
                  <Download />
                  Download
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No current prescriptions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={user.role} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar isAuthenticated={isAuthenticated} />
          <header className="flex h-16 items-center gap-2 px-4 border-b bg-white shadow">
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">EHR</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {getGreeting()}, {firstName}!
                  </h1>
                  <p className="text-gray-600">{currentDate}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate("/appointments")}
                    variant={user.role === "doctor" ? "outline" : "default"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                </div>
              </div>
              <Tabs
                defaultValue="overview"
                className="mb-6"
                onValueChange={setActiveTab}
              >
                <TabsList>
                  <TabsTrigger value="overview">
                    <BarChartIcon className="mr-2 h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  {user.role === "doctor" ? (
                    <TabsTrigger value="patients">
                      <UsersIcon className="mr-2 h-4 w-4" />
                      Patients
                    </TabsTrigger>
                  ) : (
                    <TabsTrigger value="records">
                      <ClipboardIcon className="mr-2 h-4 w-4" />
                      Medical Records
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="appointments">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Appointments
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-0">
                  {user.role === "doctor"
                    ? renderDoctorDashboard()
                    : renderPatientDashboard()}
                </TabsContent>
                <TabsContent value="patients" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-6">
                        Select "Patients" from the sidebar to view your full
                        patient list
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="records" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Medical Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-6">
                        Select "Medical Records" from the sidebar to view your
                        complete medical history
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="appointments" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-6">
                        Select "Appointments" from the sidebar to manage all
                        your appointments
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Dashboard;
