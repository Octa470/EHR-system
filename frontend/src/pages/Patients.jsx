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
import { Input } from "@/components/ui/input";
import {
  AlertCircleIcon,
  UserIcon,
  SearchIcon,
  FileTextIcon,
} from "lucide-react";
import Navbar from "@/components/pages/Navbar";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/pages/Footer";

function Patients() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

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
      if (user.role !== "doctor") {
        navigate("/dashboard");
      } else {
        fetchPatients();
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (patients.length > 0) {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    setLoadingData(true);
    try {
      const response = await fetch("/api/doctor/patients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      setPatients(data.patient.patients || []);
      setFilteredPatients(data.patient.patients || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const viewPatientRecords = (patientId) => {
    navigate(`/medicalrecords/${patientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading patients...</p>
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
                  <BreadcrumbPage>Patients</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search patients by name or email..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patient List</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                    <div className="flex justify-center py-8">
                      <Progress value={66} className="bg-gray-200 w-48" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <AlertCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
                      <p className="text-red-500">{error}</p>
                      <Button
                        onClick={() => fetchPatients()}
                        variant="outline"
                        className="mt-4"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : filteredPatients.length > 0 ? (
                    <div className="divide-y">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient._id}
                          className="py-4 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700 mr-4">
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-medium">{patient.name}</h3>
                              <p className="text-sm text-gray-500">
                                {patient.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewPatientRecords(patient._id)}
                            >
                              <FileTextIcon className="h-4 w-4 mr-2" />
                              Records
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      {searchQuery ? (
                        <p className="text-gray-500">
                          No patients found matching "{searchQuery}"
                        </p>
                      ) : (
                        <p className="text-gray-500">No patients found.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Patients;
