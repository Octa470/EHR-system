import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeftIcon,
  AlertCircleIcon,
  PlusIcon,
  TrashIcon,
  SaveIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";

function AddPrescription() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

  const [formData, setFormData] = useState({
    diagnosis: "",
    medicines: [
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ],
    additionalNotes: "",
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
        navigate("/prescriptions");
        return;
      }
      fetchPatientInfo();
    }
  }, [user, loading, patientId]);

  const fetchPatientInfo = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch patient information: ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server didn't return JSON");
      }

      const data = await response.json();
      setPatientInfo(data);
    } catch (error) {
      console.error("Error fetching patient info:", error);
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index][field] = value;
    setFormData({ ...formData, medicines: updatedMedicines });
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [
        ...formData.medicines,
        {
          medicineName: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    });
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const updatedMedicines = [...formData.medicines];
      updatedMedicines.splice(index, 1);
      setFormData({ ...formData, medicines: updatedMedicines });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const validMedicines = formData.medicines.filter(
        (med) =>
          med.medicineName.trim() &&
          med.dosage.trim() &&
          med.frequency.trim() &&
          med.duration.trim()
      );

      if (validMedicines.length === 0) {
        throw new Error(
          "At least one medication with required fields must be provided"
        );
      }

      const payload = {
        patientId,
        diagnosis: formData.diagnosis.trim(),
        medicines: validMedicines,
        additionalNotes: formData.additionalNotes.trim(),
      };

      const response = await fetch("/api/prescription/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to create prescription: ${response.status}`);
      }

      const responseData = await response.json();

      setSuccess("Prescription created successfully");
      setTimeout(() => {
        navigate("/prescriptions");
      }, 1500);
    } catch (error) {
      console.error("Error creating prescription:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading...</p>
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
                  <BreadcrumbLink href="/prescriptions">
                    Prescriptions
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Prescription</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/prescriptions")}
                  className="mr-4"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Add New Prescription
                </h1>
              </div>

              {patientInfo && (
                <div className="mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-3">
                          {patientInfo.name?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="font-medium">{patientInfo.name}</p>
                          <p className="text-sm text-gray-600">
                            {patientInfo.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
                  {success}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Prescription Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="diagnosis">
                        Diagnosis <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="diagnosis"
                        name="diagnosis"
                        placeholder="Enter diagnosis"
                        rows={3}
                        value={formData.diagnosis}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          Medications <span className="text-red-500">*</span>
                        </h3>
                        <Button
                          type="button"
                          onClick={addMedicine}
                          variant="outline"
                          size="sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Medication
                        </Button>
                      </div>

                      {formData.medicines.map((medicine, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-md">
                                Medication #{index + 1}
                              </CardTitle>
                              {formData.medicines.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMedicine(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`medicineName-${index}`}>
                                  Medicine Name{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`medicineName-${index}`}
                                  placeholder="Enter medicine name"
                                  value={medicine.medicineName}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "medicineName",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`dosage-${index}`}>
                                  Dosage <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`dosage-${index}`}
                                  placeholder="E.g., 500mg"
                                  value={medicine.dosage}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "dosage",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`frequency-${index}`}>
                                  Frequency{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`frequency-${index}`}
                                  placeholder="E.g., 3 times a day"
                                  value={medicine.frequency}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "frequency",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`duration-${index}`}>
                                  Duration{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`duration-${index}`}
                                  placeholder="E.g., 7 days"
                                  value={medicine.duration}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`instructions-${index}`}>
                                Special Instructions
                              </Label>
                              <Input
                                id={`instructions-${index}`}
                                placeholder="E.g., Take after meals"
                                value={medicine.instructions}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "instructions",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <Textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        placeholder="Any additional notes or instructions"
                        rows={3}
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Include any lifestyle changes, follow-up instructions,
                        or other notes.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/prescriptions")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        <SaveIcon className="h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Save Prescription"}
                      </Button>
                    </div>
                  </form>
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

export default AddPrescription;
