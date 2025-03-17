import {  Route, Routes } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Registration"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Dashboard from "./pages/Dashboard"
import Doctor from "./pages/Doctor"
import Appointments from "./pages/Appointments"
import Patients from "./pages/Patients"
import Notifications from "./pages/Notifications"
import MedicalRecords from "./pages/MedicalRecords"
import AddMedicalRecord from "./pages/AddMedicalRecord"
import Settings from "./pages/Settings"
import Prescriptions from "./pages/Prescriptions"
import AddPrescription from "./pages/AddPrescription"
import Billing from "./pages/Billing"
import AddBill from "./pages/AddBill"
import NotFoundPage from "./pages/NotFound"

function App() {
  return (
   <Routes>
    <Route path="/" element={<LandingPage />}></Route>
    <Route path="login" element={<Login />}></Route>
    <Route path="register" element={<Register />}></Route>
    <Route path="forgot-password" element={<ForgotPassword />}></Route>
    <Route path="reset-password" element={<ResetPassword />}></Route>
    <Route path="about" element={<About />}></Route>
    <Route path="contact" element={<Contact />}></Route>
    <Route path="dashboard" element={<Dashboard />}></Route>
    <Route path="doctor" element={<Doctor />}></Route>
    <Route path="appointments" element={<Appointments />}></Route>
    <Route path="patients" element={<Patients />}></Route>
    <Route path="notifications" element={<Notifications />}></Route>
    <Route path="medicalrecords" element={<MedicalRecords />}></Route>
    <Route path="medicalrecords/add/:patientId" element={<AddMedicalRecord />}></Route>
    <Route path="settings" element={<Settings />}></Route>
    <Route path="prescriptions" element={<Prescriptions />}></Route>
    <Route path="prescriptions/add/:patientId" element={<AddPrescription />}></Route>
    <Route path="billing" element={<Billing />}></Route>
    <Route path="billing/add/:patientId" element={<AddBill />}></Route>
    <Route path="*" element={<NotFoundPage />}></Route>
   </Routes>
  );
}

export default App;