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
import { Label } from "@/components/ui/label";
import {
  ArrowLeftIcon,
  AlertCircleIcon,
  PlusIcon,
  TrashIcon,
  SaveIcon,
  ReceiptIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";

function AddBill() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    services: [
      {
        description: "",
        cost: "",
      },
    ],
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
        navigate("/billing");
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

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;

    // Convert cost to number if it's the cost field
    if (field === "cost") {
      const numValue = parseFloat(value);
      updatedServices[index][field] = isNaN(numValue) ? value : numValue;
    } else {
      updatedServices[index][field] = value;
    }

    setFormData({ ...formData, services: updatedServices });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        {
          description: "",
          cost: "",
        },
      ],
    });
  };

  const removeService = (index) => {
    if (formData.services.length > 1) {
      const updatedServices = [...formData.services];
      updatedServices.splice(index, 1);
      setFormData({ ...formData, services: updatedServices });
    }
  };

  const calculateTotal = () => {
    return formData.services.reduce((total, service) => {
      const cost = parseFloat(service.cost);
      return total + (isNaN(cost) ? 0 : cost);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Clean and validate services data
      const validServices = formData.services.filter(
        (service) =>
          service.description.trim() && !isNaN(parseFloat(service.cost))
      );

      if (validServices.length === 0) {
        throw new Error(
          "At least one service with a description and valid cost must be provided"
        );
      }

      // Format services for submission
      const formattedServices = validServices.map((service) => ({
        description: service.description.trim(),
        cost: parseFloat(service.cost),
      }));

      // Prepare data for submission
      const payload = {
        patientId,
        services: formattedServices,
      };

      const response = await fetch("/api/billing/add", {
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
        throw new Error(`Failed to create billing record: ${response.status}`);
      }

      const responseData = await response.json();

      setSuccess("Billing record created successfully");
      setTimeout(() => {
        navigate("/billing");
      }, 1500);
    } catch (error) {
      console.error("Error creating billing record:", error);
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
                  <BreadcrumbLink href="/billing">Billing</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Bill</BreadcrumbPage>
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
                  onClick={() => navigate("/billing")}
                  className="mr-4"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Bill
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
                  <CardTitle className="flex items-center">
                    <ReceiptIcon className="mr-2 h-5 w-5" />
                    Billing Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          Services <span className="text-red-500">*</span>
                        </h3>
                        <Button
                          type="button"
                          onClick={addService}
                          variant="outline"
                          size="sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Service
                        </Button>
                      </div>

                      {formData.services.map((service, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-md">
                                Service #{index + 1}
                              </CardTitle>
                              {formData.services.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeService(index)}
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
                                <Label htmlFor={`description-${index}`}>
                                  Service Description{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`description-${index}`}
                                  placeholder="Enter service description"
                                  value={service.description}
                                  onChange={(e) =>
                                    handleServiceChange(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`cost-${index}`}>
                                  Cost (Rs){" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`cost-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="Enter cost"
                                  value={service.cost}
                                  onChange={(e) =>
                                    handleServiceChange(
                                      index,
                                      "cost",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-lg font-medium">Total Amount:</span>
                      <span className="text-lg font-bold">
                        Rs. {calculateTotal().toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/billing")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        <SaveIcon className="h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Create Bill"}
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

export default AddBill;
