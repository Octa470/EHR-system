import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircleIcon,
  FileTextIcon,
  HeartIcon,
  ActivityIcon,
  DropletIcon,
  PillIcon,
  ClipboardIcon,
  XIcon,
  SaveIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Navbar from "@/components/pages/Navbar";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/pages/Footer";
import { Progress } from "@/components/ui/progress";

function AddMedicalRecord() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    heartRate: "",
    bloodPressure: "",
    bloodSugarLevel: "",
    medicalCondition: "",
    prescribedMedications: [""],
    notes: "",
  });

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
        return;
      }
      fetchPatientDetails();
    }
  }, [user, loading, patientId]);

  const fetchPatientDetails = async () => {
    setLoadingPatient(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patient details");
      }

      const data = await response.json();
      setPatientData(data);
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setError("Could not load patient details. Please try again.");
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMedicationChange = (index, value) => {
    const updatedMedications = [...formData.prescribedMedications];
    updatedMedications[index] = value;
    setFormData({
      ...formData,
      prescribedMedications: updatedMedications,
    });
  };

  const addMedicationField = () => {
    setFormData({
      ...formData,
      prescribedMedications: [...formData.prescribedMedications, ""],
    });
  };

  const removeMedicationField = (index) => {
    const updatedMedications = [...formData.prescribedMedications];
    updatedMedications.splice(index, 1);
    setFormData({
      ...formData,
      prescribedMedications: updatedMedications,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Filter out empty medication entries
    const filteredMedications = formData.prescribedMedications.filter(
      (med) => med.trim() !== ""
    );

    try {
      const response = await fetch("/api/medicalRecords/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          heartRate: formData.heartRate ? Number(formData.heartRate) : null,
          bloodPressure: formData.bloodPressure,
          bloodSugarLevel: formData.bloodSugarLevel
            ? Number(formData.bloodSugarLevel)
            : null,
          medicalCondition: formData.medicalCondition,
          prescribedMedications: filteredMedications,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add medical record");
      }

      setSuccess(true);

      // Navigate back after short delay
      setTimeout(() => {
        navigate(`/medicalrecords`);
      }, 2000);
    } catch (error) {
      console.error("Error adding medical record:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingPatient) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "doctor") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <AlertCircleIcon className="text-red-500 h-12 w-12 mb-4" />
        <h1 className="text-xl font-medium mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          Only doctors can add medical records.
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
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
                  <BreadcrumbLink href="/medicalrecords">
                    Medical Records
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Record</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="container mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Add Medical Record
                </h1>
                <Button
                  variant="outline"
                  onClick={() => navigate("/medicalrecords")}
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Records
                </Button>
              </div>

              {patientData && (
                <div className="mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Name
                          </p>
                          <p className="text-lg">{patientData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Email
                          </p>
                          <p className="text-lg">{patientData.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
                  <AlertCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-start">
                  <SaveIcon className="h-5 w-5 mr-2 mt-0.5" />
                  <span>Medical record added successfully! Redirecting...</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileTextIcon className="mr-2 h-5 w-5" />
                      Medical Record Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="medicalCondition"
                            className="flex items-center"
                          >
                            <ClipboardIcon className="h-4 w-4 mr-2 text-orange-500" />
                            Medical Condition
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            id="medicalCondition"
                            name="medicalCondition"
                            value={formData.medicalCondition}
                            onChange={handleInputChange}
                            placeholder="Enter diagnosis or condition"
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="heartRate"
                            className="flex items-center"
                          >
                            <HeartIcon className="h-4 w-4 mr-2 text-red-500" />
                            Heart Rate (bpm)
                          </Label>
                          <Input
                            id="heartRate"
                            name="heartRate"
                            type="number"
                            value={formData.heartRate}
                            onChange={handleInputChange}
                            placeholder="Enter heart rate"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="bloodPressure"
                            className="flex items-center"
                          >
                            <ActivityIcon className="h-4 w-4 mr-2 text-blue-500" />
                            Blood Pressure
                          </Label>
                          <Input
                            id="bloodPressure"
                            name="bloodPressure"
                            value={formData.bloodPressure}
                            onChange={handleInputChange}
                            placeholder="e.g. 120/80 mmHg"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="bloodSugarLevel"
                            className="flex items-center"
                          >
                            <DropletIcon className="h-4 w-4 mr-2 text-purple-500" />
                            Blood Sugar (mg/dL)
                          </Label>
                          <Input
                            id="bloodSugarLevel"
                            name="bloodSugarLevel"
                            type="number"
                            value={formData.bloodSugarLevel}
                            onChange={handleInputChange}
                            placeholder="Enter blood sugar level"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="flex items-center">
                            <PillIcon className="h-4 w-4 mr-2 text-green-500" />
                            Prescribed Medications
                          </Label>
                          {formData.prescribedMedications.map(
                            (medication, index) => (
                              <div
                                key={index}
                                className="flex items-center mt-2"
                              >
                                <Input
                                  value={medication}
                                  onChange={(e) =>
                                    handleMedicationChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Medication ${index + 1}`}
                                  className="flex-1"
                                />
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMedicationField(index)}
                                    className="ml-2"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMedicationField}
                            className="mt-2"
                          >
                            + Add Medication
                          </Button>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="flex items-center">
                            <FileTextIcon className="h-4 w-4 mr-2 text-gray-500" />
                            Notes
                          </Label>
                          <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Enter additional notes, instructions, or observations"
                            rows={5}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/medicalrecords")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || success}>
                      {submitting ? (
                        <>
                          <span className="mr-2">Saving...</span>
                          <Progress
                            value={66}
                            className="bg-blue-200 w-16 h-1.5"
                          />
                        </>
                      ) : (
                        <>
                          <SaveIcon className="mr-2 h-4 w-4" />
                          Save Record
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AddMedicalRecord;
