import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import defaultAvatar from "../assets/default-dr-avatar.jpg";

function Doctor() {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch user data.");
        setUser(data);
        console.log("Fetched user data:" + JSON.stringify(data, null, 2));
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch doctors.");
        setDoctors(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUser();
    fetchDoctors();
  }, []);

  const handleDoctorSelection = async () => {
    try {
      const res = await fetch("/api/patient/choose-doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ doctorID: selectedDoctor }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to select doctor.");

      setUser((prev) => ({ ...prev, doctor: selectedDoctor }));

      toast.success("Doctor selected successfully!", {
        description: `You have chosen Dr. ${
          doctors.find((doc) => doc._id === selectedDoctor)?.name || "Unknown"
        }.`,
        action: {
          label: "OK",
          onClick: () => console.log("Toast dismissed"),
        },
      });
    } catch (err) {
      toast.error("Error selecting doctor", {
        description: err.message,
      });
      setError(err.message);
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Progress value={33} className="bg-gray-400 w-40" />
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
            <h1 className="text-sm">Doctor Selection</h1>
          </header>
          <div className="p-6 flex flex-col items-center justify-center flex-1">
            {user.role === "patient" && !user.doctor ? (
              <div className="w-full max-w-md bg-white p-6 border border-gray-200 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  You have not chosen a doctor yet.
                </h2>
                <p>Please select a doctor from the list below.</p>
                <Select onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="mt-4">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doc) => (
                      <SelectItem
                        key={doc._id}
                        value={doc._id}
                        className="gap-3 px-3 py-2 whitespace-nowrap bg-gray-50 hover:bg-gray-200"
                      >
                        <div className="flex items-center">
                          <img
                            src={doc.profilePicture || defaultAvatar}
                            alt="Dr."
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                          <span className="flex flex-col">
                            <span className="text-sm font-medium w-36">
                              {doc.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate w-40">
                              {doc.email}
                            </span>
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="mt-4 bg-gray-800 text-gray-100 hover:bg-transparent hover:text-gray-800 border border-gray-800"
                  onClick={handleDoctorSelection}
                  disabled={!selectedDoctor}
                >
                  Confirm Selection
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white p-6 border border-gray-200 rounded-lg shadow-lg">
                {user.doctor &&
                doctors.length > 0 &&
                doctors.find((doc) => doc._id === user.doctor._id) ? (
                  (() => {
                    const userDoctor = doctors.find(
                      (doc) => doc._id === user.doctor._id
                    );
                    return (
                      <div className="flex flex-col items-center">
                        <img
                          src={userDoctor.profilePicture || defaultAvatar}
                          alt={`Dr. ${userDoctor.name}`}
                          className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-200"
                        />
                        <h2 className="text-2xl font-bold text-gray-800">
                          Dr. {userDoctor.name}
                        </h2>
                        <p className="text-gray-600 mb-4">
                          {userDoctor.specialization || "General Practitioner"}
                        </p>
                        <div className="w-full mb-6">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Availability
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {userDoctor.availability || "85"}%
                            </span>
                          </div>
                          <Progress
                            value={userDoctor.availability || 85}
                            className="h-2"
                          />
                        </div>
                        <div className="w-full bg-gray-50 p-4 rounded-lg mb-4">
                          <h3 className="font-medium text-gray-800 mb-2">
                            Contact Information
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-600">Email:</div>
                            <div className="text-gray-800">
                              {userDoctor.email}
                            </div>
                            <div className="text-gray-600">Office:</div>
                            <div className="text-gray-800">
                              {userDoctor.office ||
                                "Room 302, Medical Building"}
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-50 p-4 rounded-lg mb-4">
                          <h3 className="font-medium text-gray-800 mb-2">
                            Next Appointment
                          </h3>
                          <div className="text-sm text-gray-800">
                            {userDoctor.nextAppointment ||
                              "No upcoming appointments"}
                          </div>
                        </div>
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            className="flex-1 bg-gray-50 text-gray-800 hover:bg-gray-800 hover:text-gray-50 border border-gray-800"
                            onClick={() =>
                              (window.location.href = "/appointments")
                            }
                          >
                            Schedule Appointment
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">
                      Loading doctor information...
                    </h2>
                    <Progress value={66} className="mb-4" />
                    <p className="text-gray-600">
                      If this persists, your doctor's information may not be
                      available.
                    </p>
                    <Button
                      className="mt-4 bg-gray-800 text-gray-100 hover:bg-transparent hover:text-gray-800 border border-gray-800"
                      onClick={() =>
                        setUser((prev) => ({ ...prev, doctor: null }))
                      }
                    >
                      Select Another Doctor
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Doctor;
