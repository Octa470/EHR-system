import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Login failed");
      } else {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Login failed");
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
          <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="block mb-1 font-semibold">
                E-Mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="block mb-1 font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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
            {error && <p className="text-red-500">{error}</p>}
            <div className="text-sm text-gray-800">
              <p>
                New User?{" "}
                <Link className="text-blue-600 hover:underline" to="/register">
                  Register Here
                </Link>
              </p>
            </div>
            <Button
              type="submit"
              className="bg-gray-800 text-gray-100 border border-transparent transition hover:bg-transparent hover:text-gray-800 hover:border-gray-800"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
