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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileTextIcon,
  UsersIcon,
  AlertCircleIcon,
  PillIcon,
  HeartIcon,
  ActivityIcon,
  ClipboardIcon,
  PlusIcon,
  DropletIcon,
  FileIcon,
} from "lucide-react";
import Navbar from "@/components/pages/Navbar";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/pages/Footer";

function MedicalRecords() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("allRecords");
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);

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
      if (user.role === "patient") {
        fetchPatientMedicalRecords();
      } else if (user.role === "doctor" && selectedPatient) {
        fetchPatientMedicalRecordsForDoctor(selectedPatient);
      } else if (user.role === "doctor") {
        fetchDoctorPatients();
      }
    }
  }, [user, loading, selectedPatient]);

  const fetchPatientMedicalRecords = async () => {
    setLoadingData(true);
    try {
      const response = await fetch("/api/medicalRecords/my-records", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch medical records");
      }

      const data = await response.json();
      setMedicalRecords(data);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPatientMedicalRecordsForDoctor = async (patientId) => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/medicalRecords/${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patient medical records");
      }

      const data = await response.json();
      setMedicalRecords(data);
    } catch (error) {
      console.error("Error fetching patient medical records:", error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDoctorPatients = async () => {
    setLoadingData(true);
    try {
      const patientsRes = await fetch("/api/doctor/patients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setRecentPatients(patientsData.patient.patients || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePatientSelect = (patientId) => {
    setSelectedPatient(patientId);
  };

  const handleAddRecord = () => {
    if (selectedPatient) {
      navigate(`/medicalrecords/add/${selectedPatient}`);
    } else {
      setError("Please select a patient first");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading medical records...</p>
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderRecordCard = (record) => (
    <Card key={record._id} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <FileTextIcon className="mr-2 h-5 w-5 text-blue-600" />
            Medical Record
          </CardTitle>
          <span className="text-sm text-gray-500">
            {formatDate(record.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm font-medium">Heart Rate:</span>
              <span className="ml-2">{record.heartRate || "N/A"} bpm</span>
            </div>
            <div className="flex items-center">
              <ActivityIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Blood Pressure:</span>
              <span className="ml-2">{record.bloodPressure || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <DropletIcon className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Blood Sugar:</span>
              <span className="ml-2">
                {record.bloodSugarLevel || "N/A"} mg/dL
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium">Condition:</span>
              <p className="mt-1 text-gray-700">{record.medicalCondition}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Medications:</span>
              <div className="mt-1">
                {record.prescribedMedications &&
                record.prescribedMedications.length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-700">
                    {record.prescribedMedications.map((med, index) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No medications prescribed</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {record.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium">Notes:</span>
            <p className="mt-1 text-gray-700 whitespace-pre-line">
              {record.notes}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-3">
        <div className="flex justify-between w-full">
          <span className="text-sm text-gray-500">
            Doctor: {record.doctor?.name || "Unknown Doctor"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );

  const renderDoctorView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-5 w-5" />
              Your Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-4">
                <Progress value={66} className="bg-gray-200 w-full" />
              </div>
            ) : recentPatients.length > 0 ? (
              <div className="space-y-2">
                {recentPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                      selectedPatient === patient._id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handlePatientSelect(patient._id)}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-2">
                      {patient.name.charAt(0)}
                    </div>
                    <span>{patient.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No patients yet</p>
              </div>
            )}
          </CardContent>
          {recentPatients.length > 0 && (
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleAddRecord}
                disabled={!selectedPatient}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </CardFooter>
          )}
        </Card>

        <div className="md:col-span-3">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {selectedPatient ? (
            loadingData ? (
              <div className="flex justify-center py-8">
                <Progress value={66} className="bg-gray-200 w-48" />
              </div>
            ) : medicalRecords.length > 0 ? (
              <div className="space-y-4">
                {medicalRecords.map((record) => renderRecordCard(record))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent>
                  <div className="py-6">
                    <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No medical records for this patient
                    </p>
                    <Button onClick={handleAddRecord}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add First Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <div className="py-6">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Select a patient to view or add medical records
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );

  const renderPatientView = () => (
    <>
      <Tabs
        defaultValue="allRecords"
        className="mb-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="allRecords">
            <FileTextIcon className="mr-2 h-4 w-4" />
            All Records
          </TabsTrigger>
          <TabsTrigger value="conditions">
            <ClipboardIcon className="mr-2 h-4 w-4" />
            Conditions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="allRecords" className="mt-4">
          {loadingData ? (
            <div className="flex justify-center py-8">
              <Progress value={66} className="bg-gray-200 w-48" />
            </div>
          ) : medicalRecords.length > 0 ? (
            <div className="space-y-4">
              {medicalRecords.map((record) => renderRecordCard(record))}
            </div>
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <div className="py-6">
                  <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No medical records available
                  </p>
                  <Button onClick={() => navigate("/appointments/book")}>
                    Schedule an Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="conditions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center py-4">
                  <Progress value={66} className="bg-gray-200 w-full" />
                </div>
              ) : medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {medicalRecords.map((record, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start">
                        <ClipboardIcon className="text-orange-500 h-5 w-5 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {record.medicalCondition}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Diagnosed: {formatDate(record.createdAt)}
                          </p>
                          {record.notes && (
                            <p className="text-sm mt-2 text-gray-700">
                              {record.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No medical conditions recorded
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
                  <BreadcrumbPage>Medical Records</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Medical Records
                </h1>
                {user.role === "doctor" && (
                  <Button onClick={handleAddRecord} disabled={!selectedPatient}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add New Record
                  </Button>
                )}
              </div>
              {user.role === "doctor"
                ? renderDoctorView()
                : renderPatientView()}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default MedicalRecords;
