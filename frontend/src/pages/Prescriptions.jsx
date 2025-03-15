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
  PlusIcon,
  DownloadIcon,
} from "lucide-react";
import Navbar from "@/components/pages/Navbar";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/pages/Footer";

function Prescriptions() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("allPrescriptions");
  const [prescriptions, setPrescriptions] = useState([]);
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
        fetchPatientPrescriptions();
      } else if (user.role === "doctor" && selectedPatient) {
        fetchPatientPrescriptionsForDoctor(selectedPatient);
      } else if (user.role === "doctor") {
        fetchDoctorPatients();
      }
    }
  }, [user, loading, selectedPatient]);

  const fetchPatientPrescriptions = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/prescription/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
      }

      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPatientPrescriptionsForDoctor = async (patientId) => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/prescription/${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patient prescriptions");
      }

      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching patient prescriptions:", error);
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

  const handleAddPrescription = () => {
    if (selectedPatient) {
      navigate(`/prescriptions/add/${selectedPatient}`);
    } else {
      setError("Please select a patient first");
    }
  };

  const handleDownloadPdf = async (prescriptionId) => {
    try {
      const response = await fetch(`/api/prescription/pdf/${prescriptionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download prescription");
      }

      // Create a blob from the PDF Stream
      const blob = await response.blob();
      // Create a link element, set the download attribute and href
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `prescription_${prescriptionId}.pdf`;
      // Append to the document body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading prescription:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading prescriptions...</p>
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

  const renderPrescriptionCard = (prescription) => (
    <Card
      key={prescription._id}
      className="mb-4 hover:shadow-md transition-shadow"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <FileTextIcon className="mr-2 h-5 w-5 text-blue-600" />
            Prescription
          </CardTitle>
          <span className="text-sm text-gray-500">
            {formatDate(prescription.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium">Diagnosis:</span>
            <p className="mt-1 text-gray-700">
              {prescription.diagnosis || "No diagnosis provided"}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium">Medicines:</span>
            {prescription.medicines && prescription.medicines.length > 0 ? (
              <div className="mt-2 space-y-2">
                {prescription.medicines.map((med, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <PillIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="font-medium">{med.medicineName}</span>
                    </div>
                    <div className="ml-6 mt-1 text-sm text-gray-600">
                      <p>Dosage: {med.dosage}</p>
                      <p>Frequency: {med.frequency}</p>
                      <p>Duration: {med.duration}</p>
                      {med.instructions && (
                        <p>Instructions: {med.instructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-gray-500">No medications prescribed</p>
            )}
          </div>

          {prescription.additionalNotes && (
            <div>
              <span className="text-sm font-medium">Additional Notes:</span>
              <p className="mt-1 text-gray-700 whitespace-pre-line">
                {prescription.additionalNotes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3">
        <div className="flex justify-between w-full">
          <span className="text-sm text-gray-500">
            Doctor: {prescription.doctor?.name || "Unknown Doctor"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf(prescription._id)}
            className="flex items-center"
          >
            <DownloadIcon className="h-4 w-4 mr-1" />
            Download PDF
          </Button>
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
                onClick={handleAddPrescription}
                disabled={!selectedPatient}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Prescription
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
            ) : prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.map((prescription) =>
                  renderPrescriptionCard(prescription)
                )}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent>
                  <div className="py-6">
                    <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No prescriptions for this patient
                    </p>
                    <Button onClick={handleAddPrescription}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add First Prescription
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
                    Select a patient to view or add prescriptions
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
        defaultValue="allPrescriptions"
        className="mb-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="allPrescriptions">
            <FileTextIcon className="mr-2 h-4 w-4" />
            All Prescriptions
          </TabsTrigger>
          <TabsTrigger value="currentMedications">
            <PillIcon className="mr-2 h-4 w-4" />
            Current Medications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="allPrescriptions" className="mt-4">
          {loadingData ? (
            <div className="flex justify-center py-8">
              <Progress value={66} className="bg-gray-200 w-48" />
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) =>
                renderPrescriptionCard(prescription)
              )}
            </div>
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <div className="py-6">
                  <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No prescriptions available
                  </p>
                  <Button onClick={() => navigate("/appointments/book")}>
                    Schedule an Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="currentMedications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center py-4">
                  <Progress value={66} className="bg-gray-200 w-full" />
                </div>
              ) : prescriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prescriptions
                    .flatMap((prescription) =>
                      prescription.medicines.map((med, idx) => ({
                        ...med,
                        date: prescription.createdAt,
                        prescriptionId: prescription._id,
                        uniqueId: `${prescription._id}-${idx}`,
                      }))
                    )
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 9) // Show only the 9 most recent medications
                    .map((medication) => (
                      <div
                        key={medication.uniqueId}
                        className="bg-white p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start">
                          <PillIcon className="text-green-500 h-5 w-5 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              {medication.medicineName}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Dosage: {medication.dosage}
                            </p>
                            <p className="text-sm text-gray-600">
                              {medication.frequency}
                            </p>
                            <p className="text-sm text-gray-600">
                              Duration: {medication.duration}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Prescribed: {formatDate(medication.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No medications currently prescribed
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
                  <BreadcrumbPage>Prescriptions</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Prescriptions
                </h1>
                {user.role === "doctor" && (
                  <Button
                    onClick={handleAddPrescription}
                    disabled={!selectedPatient}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add New Prescription
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

export default Prescriptions;
