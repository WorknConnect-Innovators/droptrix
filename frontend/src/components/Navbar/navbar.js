import React, { useState, useRef, useEffect } from "react";
import {
  UserRound,
  Menu,
  X,
  LogIn,
  UserPlus,
  Home,
  Briefcase,
  Info,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="py-4 lg:px-36 md:px-16 sm:px-8 px-6 flex justify-between items-center shadow-sm border-b border-2 sticky top-0 bg-white z-50">
        {/* Left: Logo + Nav (Desktop) */}
        <div className="flex items-center gap-x-6">
          <img src="logo.jpg" alt="Logo" className="lg:h-16 md:h-14 h-12" />
          <ul className="hidden lg:flex gap-x-6 font-semibold text-lg text-blue-900">
            <li className="cursor-pointer hover:text-blue-600 transition">Plans</li>
            <li className="cursor-pointer hover:text-blue-600 transition">Companies</li>
            <li className="cursor-pointer hover:text-blue-600 transition">How it works</li>
            <li className="cursor-pointer hover:text-blue-600 transition">Contact</li>
          </ul>
        </div>

        <div className="flex items-center gap-x-2 md:gap-x-4">
          <button className=" bg-blue-900 text-white md:text-sm text-xs py-2 px-6 rounded-full hover:bg-blue-700 hover:shadow-md transition">
            Pay as you go
          </button>
          <div className="relative" ref={containerRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border-2 md:p-2 p-1.5 cursor-pointer hover:bg-gray-100 transition"
            >
              <UserRound className="text-blue-600 md:w-6 md:h-6 w-5 h-5  " />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border">
                <div className="py-1 text-sm font-medium text-gray-700">
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <LogIn className="w-4 h-4 text-blue-600" /> Login
                  </Link>
                  <Link to="/signup" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <UserPlus className="w-4 h-4 text-green-600" /> Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu (mobile only) */}
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setSidebar(true)}
          >
            <Menu className="w-7 h-7 text-blue-900" />
          </button>
        </div>
      </nav>

      {/* SIDEBAR (Mobile) */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          sidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <img src="logo.jpg" alt="Logo" className="h-10" />
          <button
            onClick={() => setSidebar(false)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-blue-900" />
          </button>
        </div>

        {/* Sidebar Links */}
        <ul className="flex flex-col gap-y-4 p-6 font-semibold text-lg text-blue-900">
          <li className="flex items-center gap-3 hover:text-blue-600 cursor-pointer">
            <Home className="w-5 h-5 text-blue-600" /> Plans
          </li>
          <li className="flex items-center gap-3 hover:text-blue-600 cursor-pointer">
            <Briefcase className="w-5 h-5 text-blue-600" /> Companies
          </li>
          <li className="flex items-center gap-3 hover:text-blue-600 cursor-pointer">
            <Info className="w-5 h-5 text-blue-600" /> How it works
          </li>
          <li className="flex items-center gap-3 hover:text-blue-600 cursor-pointer">
            <Phone className="w-5 h-5 text-blue-600" /> Contact
          </li>
        </ul>

        {/* Sidebar Footer (Profile) */}
        <div className="absolute bottom-6 left-0 w-full px-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 mb-3 border rounded-lg hover:bg-gray-100">
            <LogIn className="w-5 h-5 text-blue-600" /> Login
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="w-5 h-5" /> Sign Up
          </button>
        </div>
      </div>

      {/* Overlay for Sidebar */}
      {sidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setSidebar(false)}
        />
      )}
    </>
  );
}
