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
      icon: <Shield className="w-6 h-6 text-teal-400" />,
      title: "Secure & Private",
      description:
        "Advanced encryption and strict access controls protect sensitive patient information.",
    },
    {
      icon: <Clock className="w-6 h-6 text-teal-400" />,
      title: "Time-Saving",
      description:
        "Streamlined workflows reduce administrative burden and free up time for patient care.",
    },
    {
      icon: <LineChart className="w-6 h-6 text-teal-400" />,
      title: "Data-Driven Insights",
      description:
        "Analytics tools help identify trends and improve treatment outcomes.",
    },
    {
      icon: <Users className="w-6 h-6 text-teal-400" />,
      title: "Collaborative Care",
      description:
        "Seamless information sharing promotes better coordination between providers.",
    },
  ];

  const benefits = [
    "Enhanced patient engagement and satisfaction",
    "Improved care coordination between providers",
    "Increased operational efficiency and reduced errors",
    "Better data analysis for clinical decision making",
    "Reduced administrative costs and paperwork",
    "Secure, HIPAA-compliant data management",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="flex flex-col items-center justify-between flex-grow">
        <div className="md:w-1/2 px-5 text-left">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About our EHR System
          </h2>
          <p className="text-gray-700 mb-6">
            Our Electronic Health Record (EHR) system helps healthcare providers
            deliver better patient care through secure, efficient information
            management.
          </p>
        </div>

        <div className="md:w-1/2 p-5">
          <div className="grid grid-cols-1 gap-8">
            <Card className="border border-gray-200 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Key Features
                </h3>
                <div className="space-y-4">
                  {features.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-blue-50 p-2 rounded-full mr-3">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">
                          {item.title}
                        </p>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Benefits
                </h3>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Frequently Asked Questions
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="item-1"
                    className="border-b border-gray-200"
                  >
                    <AccordionTrigger className="text-base font-medium hover:bg-gray-50 py-3">
                      What could this system be used for?
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-gray-700">
                      This EHR system can primarily be used for streamlining
                      medical procedures, reducing paperwork, and making
                      healthcare more efficient. It allows providers to access
                      patient information quickly and securely, resulting in
                      better care coordination and improved patient outcomes.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="item-2"
                    className="border-b border-gray-200"
                  >
                    <AccordionTrigger className="text-base font-medium hover:bg-gray-50 py-3">
                      What are the technologies used for development?
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-gray-700">
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
                    <AccordionTrigger className="text-base font-medium hover:bg-gray-50 py-3">
                      How does this system handle security?
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-gray-700">
                      <p>
                        Our EHR system implements multiple layers of security to
                        protect sensitive patient data:
                      </p>
                      <ul className="list-disc pl-5 mt-2">
                        <li>JWT for secure authentication and authorization</li>
                        <li>Bcryptjs for password hashing and encryption</li>
                        <li>Data encryption in transit and at rest</li>
                        <li>
                          Access controls based on user roles and permissions
                        </li>
                        <li>Secure database configuration and storage</li>
                        <li>Regular security audits and updates</li>
                      </ul>
                      <p className="mt-2">
                        These measures ensure that user data remains private and
                        secure, with passwords stored in encrypted format that
                        cannot be decoded, even by system administrators.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About;
