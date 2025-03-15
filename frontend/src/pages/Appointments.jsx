import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { CalendarIcon, Check, X, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navbar from "@/components/pages/Navbar";
import { AppSidebar } from "@/components/app-sidebar";
import Footer from "@/components/pages/Footer";

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewAppointment, setOpenNewAppointment] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  const isDoctor = user?.role === "doctor";
  const isPatient = user?.role === "patient";

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
    Completed: "bg-blue-100 text-blue-800",
  };

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments. Please try again.");
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (isPatient) {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const userData = await response.json();
          if (userData.doctor) {
            setDoctor(userData.doctor);
          }
        } else if (isDoctor) {
          const response = await fetch("/api/doctor/patients", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch patients");
          }

          const patientsData = await response.json();
          setPatients(patientsData.patient.patients || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data. Please try again.");
      }
    };

    fetchUserData();
  }, [isPatient, isDoctor]);

  const handleCreateAppointment = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        toast.error("Please select both date and time");
        return;
      }

      const appointmentDate = format(selectedDate, "yyyy-MM-dd");

      const payload = {
        date: appointmentDate,
        time: selectedTime,
      };

      if (isPatient) {
        if (!doctor) {
          toast.error("No doctor assigned to your profile");
          return;
        }
        payload.doctorId = doctor._id;
      } else if (isDoctor) {
        if (!selectedPatient) {
          toast.error("Please select a patient");
          return;
        }
        payload.patientId = selectedPatient;
      }

      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      const data = await response.json();

      setAppointments([...appointments, data.appointment]);
      setOpenNewAppointment(false);

      setSelectedDate(new Date());
      setSelectedTime("");
      setSelectedPatient("");

      toast.success("Appointment requested successfully!");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(error.message || "Failed to create appointment");
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update appointment");
      }

      setAppointments(
        appointments.map((apt) =>
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.message || "Failed to update appointment");
    }
  };

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "Pending"
  );
  const confirmedAppointments = appointments.filter(
    (apt) => apt.status === "Confirmed"
  );
  const pastAppointments = appointments.filter((apt) =>
    ["Completed", "Cancelled"].includes(apt.status)
  );

  const formatAppointmentDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
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
            <h1 className="text-sm">Appointments</h1>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Appointments
                </h1>
                <Dialog
                  open={openNewAppointment}
                  onOpenChange={setOpenNewAppointment}
                >
                  <DialogTrigger asChild>
                    <Button>
                      {isDoctor
                        ? "Schedule New Appointment"
                        : "Book Appointment"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-md bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold mb-2 text-center text-gray-900">
                        {isDoctor ? "Schedule Appointment" : "Book Appointment"}
                      </DialogTitle>
                      <DialogDescription className="text-center text-gray-600 mb-4">
                        {isDoctor
                          ? "Create an appointment for a patient."
                          : doctor
                          ? `Book an appointment with Dr. ${doctor.name}`
                          : "You need to be assigned to a doctor first."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {isDoctor && (
                        <div>
                          <Label
                            htmlFor="patient"
                            className="block mb-1 font-semibold"
                          >
                            Patient
                          </Label>
                          <Select
                            value={selectedPatient}
                            onValueChange={setSelectedPatient}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem
                                  key={patient._id}
                                  value={patient._id}
                                  className="bg-gray-50 hover:bg-gray-200"
                                >
                                  {patient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div>
                        <Label
                          htmlFor="date"
                          className="block mb-1 font-semibold"
                        >
                          Date
                        </Label>
                        <Popover modal>
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              variant="outline"
                              className="w-full justify-start text-left font-normal px-4 py-2"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate
                                ? format(selectedDate, "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="bottom"
                            align="start"
                            className="w-auto p-0"
                          >
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              className="border rounded-md bg-gray-100"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label
                          htmlFor="time"
                          className="block mb-1 font-semibold"
                        >
                          Time
                        </Label>
                        <Select
                          value={selectedTime}
                          onValueChange={setSelectedTime}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-50">
                            {timeSlots.map((time) => (
                              <SelectItem
                                key={time}
                                value={time}
                                className="hover:bg-gray-200"
                              >
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleCreateAppointment}
                        className="w-full mt-4 hover:bg-gray-200"
                        disabled={isPatient && !doctor}
                      >
                        {isDoctor ? "Schedule Appointment" : "Book Appointment"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">
                    Pending
                    {pendingAppointments.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {pendingAppointments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="confirmed">
                    Confirmed
                    {confirmedAppointments.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {confirmedAppointments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past Appointments
                    {pastAppointments.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {pastAppointments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  {pendingAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No pending appointments
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {pendingAppointments.map((appointment) => (
                        <Card key={appointment._id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex justify-between">
                              <span>
                                {isDoctor
                                  ? appointment.patientId.name
                                  : `Dr. ${appointment.doctorId.name}`}
                              </span>
                              <Badge
                                className={statusColors[appointment.status]}
                              >
                                {appointment.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {formatAppointmentDate(appointment.date)} at{" "}
                              {appointment.time}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm">
                              {isDoctor ? (
                                <p>
                                  Patient Email: {appointment.patientId.email}
                                </p>
                              ) : (
                                <p>
                                  Doctor Email: {appointment.doctorId.email}
                                </p>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            {isDoctor && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment._id,
                                      "Cancelled"
                                    )
                                  }
                                >
                                  <X className="mr-1 h-4 w-4" /> Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment._id,
                                      "Confirmed"
                                    )
                                  }
                                >
                                  <Check className="mr-1 h-4 w-4" /> Confirm
                                </Button>
                              </>
                            )}
                            {isPatient && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment._id,
                                    "Cancelled"
                                  )
                                }
                              >
                                <X className="mr-1 h-4 w-4" /> Cancel
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="confirmed">
                  {confirmedAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No confirmed appointments
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {confirmedAppointments.map((appointment) => (
                        <Card key={appointment._id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex justify-between">
                              <span>
                                {isDoctor
                                  ? appointment.patientId.name
                                  : `Dr. ${appointment.doctorId.name}`}
                              </span>
                              <Badge
                                className={statusColors[appointment.status]}
                              >
                                {appointment.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {formatAppointmentDate(appointment.date)} at{" "}
                              {appointment.time}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm">
                              {isDoctor ? (
                                <p>
                                  Patient Email: {appointment.patientId.email}
                                </p>
                              ) : (
                                <p>
                                  Doctor Email: {appointment.doctorId.email}
                                </p>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            {isDoctor && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment._id,
                                      "Cancelled"
                                    )
                                  }
                                >
                                  <X className="mr-1 h-4 w-4" /> Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment._id,
                                      "Completed"
                                    )
                                  }
                                >
                                  <Check className="mr-1 h-4 w-4" /> Mark
                                  Complete
                                </Button>
                              </>
                            )}
                            {isPatient && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment._id,
                                    "Cancelled"
                                  )
                                }
                              >
                                <X className="mr-1 h-4 w-4" /> Cancel
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past">
                  {pastAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No past appointments
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>
                                {isDoctor ? "Patient" : "Doctor"}
                              </TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pastAppointments.map((appointment) => (
                              <TableRow key={appointment._id}>
                                <TableCell>
                                  {isDoctor
                                    ? appointment.patientId.name
                                    : `Dr. ${appointment.doctorId.name}`}
                                </TableCell>
                                <TableCell>
                                  {formatAppointmentDate(appointment.date)}
                                </TableCell>
                                <TableCell>{appointment.time}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={statusColors[appointment.status]}
                                  >
                                    {appointment.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Appointments;
