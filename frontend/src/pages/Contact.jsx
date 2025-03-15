import React, { useState, useEffect } from "react";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

function Contact() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-teal-400" />,
      title: "Email",
      detail: "isha.sanskritee@gmail.com",
    },
    {
      icon: <Phone className="w-6 h-6 text-teal-400" />,
      title: "Phone",
      detail: "+91 79783 22732",
    },
    {
      icon: <MapPin className="w-6 h-6 text-teal-400" />,
      title: "Address",
      detail: "Kalinga University, Naya Raipur, Chattisgarh",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="bg-teal-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl">
            Have questions about our EHR system? We're here to help. Reach out
            to our team for support, information, or to schedule a demo.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex-1 py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border border-gray-200 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Contact Information
              </h3>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-blue-50 p-2 rounded-full mr-3">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{item.title}</p>
                      <p className="text-gray-600">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                College Hours
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Monday - Saturday:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Sunday:</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Contact;
