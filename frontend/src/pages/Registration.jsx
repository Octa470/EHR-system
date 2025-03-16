import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, UploadCloud } from "lucide-react";

function Register() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
        console.log("Attaching profile picture:", profilePicture.name);
      }
  
      console.log("Submitting registration form");
      
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });
  
      console.log("Registration response status:", res.status);
      
      const data = await res.json();
      console.log("Registration response:", data);
      
      if (!res.ok) {
        setError(data.message || data.error || "Registration failed");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed: " + (err.message || "Unknown error"));
    }
  };

  if (localStorage.getItem("token") !== null) {
    navigate("/dashboard");
  }

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-6 border border-gray-200 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Register/Sign Up
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="doctor"
                    className="bg-gray-50 hover:bg-gray-200"
                  >
                    Doctor
                  </SelectItem>
                  <SelectItem
                    value="patient"
                    className="bg-gray-50 hover:bg-gray-200"
                  >
                    Patient
                  </SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={role} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  onClick={togglePassword}
                  variant="ghost"
                  className="absolute right-2 top-0.5 p-0 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button variant="outline" className="flex items-center gap-2">
                  <UploadCloud size={18} /> Upload
                </Button>
              </div>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 w-24 h-24 object-cover rounded-full border"
                />
              )}
            </div>
            <div className="text-sm text-gray-800">
              {error && <p className="text-red-500">{error}</p>}
              <p>
                Existing User?{" "}
                <Link className="text-blue-600 hover:underline" to="/login">
                  Login Here
                </Link>
              </p>
            </div>
            <Button
              type="submit"
              className="bg-gray-800 text-gray-100 hover:bg-transparent hover:text-gray-800 border border-gray-800"
            >
              Register
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
