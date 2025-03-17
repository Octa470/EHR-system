import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else {
        setMessage("Password reset link generated below");
        setResetLink(data.resetLink);
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-6 border border-gray-200 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Forgot Password
          </h1>

          {message && (
            <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
              {message}
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="block mb-1 font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-800 text-gray-100 border border-transparent transition hover:bg-transparent hover:text-gray-800 hover:border-gray-800"
            >
              Request Reset
            </Button>

            {resetLink && (
              <div className="mt-4">
                <p className="mb-2">Your reset link:</p>
                <Link to={resetLink} className="text-blue-600 break-all">
                  {resetLink}
                </Link>
              </div>
            )}

            <div className="text-sm text-gray-800 text-center">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ForgotPassword;
