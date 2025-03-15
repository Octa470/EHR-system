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
  ReceiptIcon,
  PlusIcon,
  DownloadIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";
import Navbar from "@/components/pages/Navbar";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/pages/Footer";

function Billing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("allBills");
  const [bills, setBills] = useState([]);
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
        fetchPatientBills();
      } else if (user.role === "doctor" && selectedPatient) {
        fetchPatientBillsForDoctor(selectedPatient);
      } else if (user.role === "doctor") {
        fetchDoctorPatients();
      }
    }
  }, [user, loading, selectedPatient]);

  const fetchPatientBills = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/billing/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch billing records");
      }

      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error("Error fetching billing records:", error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPatientBillsForDoctor = async (patientId) => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/billing/${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patient billing records");
      }

      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error("Error fetching patient billing records:", error);
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

  const handleAddBill = () => {
    if (selectedPatient) {
      navigate(`/billing/add/${selectedPatient}`);
    } else {
      setError("Please select a patient first");
    }
  };

  const handleDownloadInvoice = async (billId) => {
    try {
      const response = await fetch(`/api/billing/invoice/${billId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      // Create a blob from the PDF Stream
      const blob = await response.blob();
      // Create a link element, set the download attribute and href
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_${billId}.pdf`;
      // Append to the document body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      setError(error.message);
    }
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      const response = await fetch(`/api/billing/pay/${billId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark bill as paid");
      }

      // Update the bill status in the UI
      setBills(
        bills.map((bill) =>
          bill._id === billId ? { ...bill, status: "paid" } : bill
        )
      );
    } catch (error) {
      console.error("Error marking bill as paid:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading billing information...</p>
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

  const renderBillCard = (bill) => (
    <Card key={bill._id} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <ReceiptIcon className="mr-2 h-5 w-5 text-blue-600" />
            Invoice
            <span
              className={`ml-2 text-xs px-2 py-1 rounded-full ${
                bill.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {bill.status === "paid" ? "PAID" : "PENDING"}
            </span>
          </CardTitle>
          <span className="text-sm text-gray-500">
            {formatDate(bill.issuedAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Doctor:</span>
            <span className="text-gray-700">
              {bill.doctor?.name || "Unknown Doctor"}
            </span>
          </div>

          <div>
            <span className="text-sm font-medium">Services:</span>
            {bill.services && bill.services.length > 0 ? (
              <div className="mt-2 space-y-2">
                {bill.services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-md flex justify-between"
                  >
                    <span>{service.description}</span>
                    <span className="font-medium">
                      Rs. {service.cost.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-gray-500">No services listed</p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-medium">Total Amount:</span>
            <span className="text-lg font-bold">
              Rs. {bill.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3">
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadInvoice(bill._id)}
            className="flex items-center"
          >
            <DownloadIcon className="h-4 w-4 mr-1" />
            Download Invoice
          </Button>

          {user.role === "doctor" && bill.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAsPaid(bill._id)}
              className="flex items-center text-green-600 border-green-600 hover:bg-green-50"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Mark as Paid
            </Button>
          )}
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
                onClick={handleAddBill}
                disabled={!selectedPatient}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add New Bill
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
            ) : bills.length > 0 ? (
              <div className="space-y-4">
                {bills.map((bill) => renderBillCard(bill))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent>
                  <div className="py-6">
                    <ReceiptIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No billing records for this patient
                    </p>
                    <Button onClick={handleAddBill}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add First Bill
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
                    Select a patient to view or add billing records
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
        defaultValue="allBills"
        className="mb-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="allBills">
            <ReceiptIcon className="mr-2 h-4 w-4" />
            All Invoices
          </TabsTrigger>
          <TabsTrigger value="pendingBills">
            <ClockIcon className="mr-2 h-4 w-4" />
            Pending Payments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="allBills" className="mt-4">
          {loadingData ? (
            <div className="flex justify-center py-8">
              <Progress value={66} className="bg-gray-200 w-48" />
            </div>
          ) : bills.length > 0 ? (
            <div className="space-y-4">
              {bills.map((bill) => renderBillCard(bill))}
            </div>
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <div className="py-6">
                  <ReceiptIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No billing records available
                  </p>
                  <Button onClick={() => navigate("/appointments/book")}>
                    Schedule an Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="pendingBills" className="mt-4">
          {loadingData ? (
            <div className="flex justify-center py-8">
              <Progress value={66} className="bg-gray-200 w-48" />
            </div>
          ) : bills.filter((bill) => bill.status === "pending").length > 0 ? (
            <div className="space-y-4">
              {bills
                .filter((bill) => bill.status === "pending")
                .map((bill) => renderBillCard(bill))}
            </div>
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <div className="py-6">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No pending payments</p>
                </div>
              </CardContent>
            </Card>
          )}
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
                  <BreadcrumbPage>Billing</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Billing & Invoices
                </h1>
                {user.role === "doctor" && (
                  <Button onClick={handleAddBill} disabled={!selectedPatient}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create New Invoice
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

export default Billing;
