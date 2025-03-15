import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar({ isAuthenticated }) {
  return (
    <nav className="flex justify-between items-center px-5 py-5 text-lg">
      <h1 className="text-2xl font-bold">Sanskritee Shilpa Pandey</h1>

      <div className="hidden md:flex space-x-6">
        <Button variant="ghost" className="hover:bg-gray-200">
          <Link to="/">Home</Link>
        </Button>
        <Button variant="ghost" className="hover:bg-gray-200">
          <Link to="/about">About</Link>
        </Button>
        <Button variant="ghost" className="hover:bg-gray-200">
          <Link to="/contact">Contact</Link>
        </Button>
        {isAuthenticated ? (
          <Button className="bg-gray-800 text-gray-100 border border-transparent transition hover:bg-transparent hover:text-gray-800 hover:border-gray-800">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button className="bg-gray-800 text-gray-100 border border-transparent transition hover:bg-transparent hover:text-gray-800 hover:border-gray-800">
              <Link to="/login">Login</Link>
            </Button>
            <Button className="bg-gray-800 text-gray-100 border border-transparent transition hover:bg-transparent hover:text-gray-800 hover:border-gray-800">
              <Link to="/register">Sign Up</Link>
            </Button>
          </>
        )}
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-3/4 bg-white">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-4 mt-4">
              <Button
                variant="ghost"
                className="w-full text-left"
              >
                 <Link to="/">Home</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left"
              >
                <Link to="/about">About</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left"
              >
                <Link to="/contact">Contact</Link>
              </Button>
              {isAuthenticated ? (
                <Button className="w-full text-left">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button className="w-full text-left">
                  <Link to="/login">Login</Link>
                  </Button>
                  <Button className="w-full text-left">
                  <Link to="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default Navbar;
