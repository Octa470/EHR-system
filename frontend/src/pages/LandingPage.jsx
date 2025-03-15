import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import pagebg from "../assets/page-bg.png";
import { Link } from "react-router-dom";

function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="flex flex-col md:flex-row items-center justify-between flex-grow">
        <div className="md:w-1/2 px-5 text-left">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Helping Doctors and Patients Connect with EHR
          </h2>
          <p className="text-gray-700 mb-6">
            An innovative platform designed to streamline health records and
            improve patient care.
          </p>
          <div className="space-x-4">
            <Link to={"/register"}>
              <Button className="bg-gray-800 text-gray-100  border border-transparent transition hover:bg-transparent hover:text-gray-800 hover:border-gray-800">
                Get Started
              </Button>
            </Link>
            <Link to={"/about"}>
              <Button
                variant="outline"
                className="border-gray-800 text-gray-800 transition hover:bg-gray-800 hover:text-gray-100 hover:border-transparent"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0">
          <img
            src={pagebg}
            className="w-full object-cover"
            alt="Image of a doctor for the EHR-system"
          />
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default LandingPage;
