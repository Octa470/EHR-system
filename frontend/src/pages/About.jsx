import React, { useState, useEffect } from "react";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, LineChart, Users } from "lucide-react";

function About() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const features = [
    {
      icon: <Shield className="w-10 h-10 text-teal-400" />,
      title: "Secure & Private",
      description:
        "Advanced encryption and strict access controls protect sensitive patient information.",
    },
    {
      icon: <Clock className="w-10 h-10 text-teal-400" />,
      title: "Time-Saving",
      description:
        "Streamlined workflows reduce administrative burden and free up time for patient care.",
    },
    {
      icon: <LineChart className="w-10 h-10 text-teal-400" />,
      title: "Data-Driven Insights",
      description:
        "Analytics tools help identify trends and improve treatment outcomes.",
    },
    {
      icon: <Users className="w-10 h-10 text-teal-400" />,
      title: "Collaborative Care",
      description:
        "Seamless information sharing promotes better coordination between providers.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="bg-teal-500 text-white py-16">
        <div className="w-10/12 md:w-9/12 mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Modern Healthcare Records Management
          </h1>
          <p className="text-xl max-w-3xl">
            Our Electronic Health Record system helps healthcare providers
            deliver better patient care through secure, efficient information
            management.
          </p>
        </div>
      </div>

      <div className="w-10/12 md:w-9/12 mx-auto flex-1 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              About Our EHR System
            </h2>
            <p className="text-gray-700">
              This Electronic Health Record (EHR) website is a secure online
              platform designed to store, manage, and share patient medical
              information. This centralized system enables healthcare providers
              to access and update patient records, facilitating coordinated
              care and improved patient outcomes.
            </p>
            <p className="text-gray-700">
              Key features include patient portals, medical records management,
              appointment scheduling, billing and insurance processing,
              prescription management, and lab result tracking.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Benefits
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Enhanced patient engagement and satisfaction</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Improved care coordination between providers</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Increased operational efficiency and reduced errors</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Better data analysis for clinical decision making</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Reduced administrative costs and paperwork</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Secure, HIPAA-compliant data management</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 bg-blue-50 p-4 rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <AccordionItem value="item-1" className="border-b border-gray-200">
              <AccordionTrigger className="text-base font-medium px-6 hover:bg-gray-50">
                What could this system be used for?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-700">
                This EHR system can primarily be used for streamlining medical
                procedures, reducing paperwork, and making healthcare more
                efficient. It allows providers to access patient information
                quickly and securely, resulting in better care coordination and
                improved patient outcomes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b border-gray-200">
              <AccordionTrigger className="text-base font-medium px-6 hover:bg-gray-50">
                What are the technologies used for development?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Backend:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Node.js</li>
                      <li>Express</li>
                      <li>Jsonwebtoken (JWT)</li>
                      <li>Bcryptjs</li>
                      <li>Cross Origin Resource Sharing (CORS)</li>
                      <li>Mongoose/MongoDB (Database)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Frontend:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Vite + React</li>
                      <li>Tailwind CSS</li>
                      <li>ShadCN/UI</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base font-medium px-6 hover:bg-gray-50">
                How does this system handle security?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-700">
                <p>
                  Our EHR system implements multiple layers of security to
                  protect sensitive patient data:
                </p>
                <ul className="list-disc pl-5 mt-2">
                  <li>JWT for secure authentication and authorization</li>
                  <li>Bcryptjs for password hashing and encryption</li>
                  <li>Data encryption in transit and at rest</li>
                  <li>Access controls based on user roles and permissions</li>
                  <li>Secure database configuration and storage</li>
                  <li>Regular security audits and updates</li>
                </ul>
                <p className="mt-2">
                  These measures ensure that user data remains private and
                  secure, with passwords stored in encrypted format that cannot
                  be decoded, even by system administrators.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About;
