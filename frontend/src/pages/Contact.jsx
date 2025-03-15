import React, { useState, useEffect } from "react";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

function Contact() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => { const token = localStorage.getItem("token"); setIsAuthenticated(!!token); }, []);

  const contactInfo = [
    { icon: <Mail className="w-6 h-6 text-teal-400" />, title: "Email", detail: "isha.sanskritee@gmail.com" },
    { icon: <Phone className="w-6 h-6 text-teal-400" />, title: "Phone", detail: "+91 79783 22732" },
    { icon: <MapPin className="w-6 h-6 text-teal-400" />, title: "Address", detail: "Kalinga University, Naya Raipur, Chattisgarh" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />
      
      <div className="flex flex-col items-center justify-between flex-grow">
        <div className="md:w-1/2 px-5 text-left">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-6">Have questions about our EHR system? We're here to help. Reach out to our team for support, information, or to schedule a demo.</p>
        </div>
        
        <div className="md:w-1/2 p-5">
          <div className="grid grid-cols-1 gap-8">
            <Card className="border border-gray-200 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Contact Information</h3>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-blue-50 p-2 rounded-full mr-3">{item.icon}</div>
                      <div><p className="font-medium text-gray-700">{item.title}</p><p className="text-gray-600">{item.detail}</p></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">College Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-gray-700">Monday - Saturday:</span><span className="font-medium">9:00 AM - 6:00 PM</span></div>
                  <div className="flex justify-between"><span className="text-gray-700">Sunday:</span><span className="font-medium">Closed</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Contact;