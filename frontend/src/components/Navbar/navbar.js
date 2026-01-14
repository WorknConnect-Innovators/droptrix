import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Menu,
  LogIn,
  UserPlus,
  Building2,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const dropdownTimeout = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dropdowns = {
    plans: {
      title: "Choose Your Plan",
      desc: "Flexible pricing plans on all networks.",
      links: [
        { label: "Prepaid Plans", path: "/plans/Prepaid" },
        { label: "Postpaid Plans", path: "/plans/Postpaid" },
        { label: "Company Plans", path: "/plans/Company" },
      ],
    },
    companies: {
      title: "Choose your favourite Company",
      desc: "Explore and connect with top mobile companies.",
      links: [
        { label: "T-Mobile", path: "/companies/T-Mobile" },
        { label: "AT&T", path: "/companies/AT&T" },
        { label: "Linkup Mobile", path: "/companies/Linkup Mobile" },
        { label: "Mobile X", path: "/companies/Mobile X" },
        { label: "Lyca Mobile", path: "/companies/Lyca Mobile" },
        { label: "Trum Mobile", path: "/companies/Trum Mobile" },
      ],
    },
  };

  // Handle delayed closing (so it doesn't flicker)
  const handleMouseEnter = (menu) => {
    clearTimeout(dropdownTimeout.current);
    setHoveredNav(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setHoveredNav(null);
    }, 150); // small delay prevents flickering
  };

  return (
    <nav className="py-4 lg:px-36 md:px-16 sm:px-8 px-6 flex justify-between items-center shadow-sm border-b sticky top-0 bg-white z-50">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-x-6 relative">
        <Link to="/">
          <img src="logo.jpg" alt="Logo" className="lg:h-16 md:h-14 h-12" />
        </Link>

        <ul className="hidden lg:flex gap-x-6 font-semibold text-lg text-blue-900 relative">
          <li
            className="cursor-pointer hover:text-blue-600 transition"
            onMouseEnter={() => handleMouseEnter("plans")}
            onMouseLeave={handleMouseLeave}
          >
            Plans
          </li>
          <Link to={"/carriers"}
            className="cursor-pointer hover:text-blue-600 transition"
          >
            Carriers
          </Link>
          <li className="cursor-pointer hover:text-blue-600 transition">
            How it works
          </li>

          <Link to={'/contact'} className="cursor-pointer hover:text-blue-600 transition">
            Contact
          </Link>
        </ul>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-x-2 md:gap-x-4">
        <Link to={'/carriers'} state={{ clickedButton: "PayAsYouGo" }} className=" bg-blue-900 text-white md:text-sm text-xs py-2 px-6 rounded-full hover:bg-blue-700 hover:shadow-md transition">
          Pay as you go
        </Link>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border-2 md:p-2 p-1.5 cursor-pointer hover:bg-gray-100 transition"
          >
            <UserRound className="text-blue-600 md:w-6 md:h-6 w-5 h-5" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border">
              <div className="py-1 text-sm font-medium text-gray-700">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-blue-600" /> Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-green-600" /> Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded hover:bg-gray-100"
        >
          <Menu className="w-7 h-7 text-blue-900" />
        </button>
      </div>

      {/* FULL-WIDTH DROPDOWN */}
      {hoveredNav && dropdowns[hoveredNav] && (
        <div
          className={`absolute left-0 top-full w-full bg-white shadow-lg border-t border-gray-200 flex justify-between px-16 py-8 transition-all duration-300 ${hoveredNav ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-3"
            }`}
          onMouseEnter={() => handleMouseEnter(hoveredNav)}
          onMouseLeave={handleMouseLeave}
        >
          {/* LEFT SIDE */}
          <div className="w-1/3 pr-12 border-r border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              {hoveredNav === "companies" ? (
                <Building2 className="text-blue-600 w-8 h-8" />
              ) : (
                <Layers className="text-blue-600 w-8 h-8" />
              )}
              <h3 className="text-2xl font-bold text-blue-900">
                {dropdowns[hoveredNav].title}
              </h3>
            </div>
            <p className="text-gray-600 text-lg">{dropdowns[hoveredNav].desc}</p>
          </div>

          {/* RIGHT SIDE LINKS */}
          <div className="w-2/3 grid grid-cols-3 gap-4 pl-8 my-auto">
            {dropdowns[hoveredNav].links.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setHoveredNav(null)}
                className="group h-fit flex items-center justify-between bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg px-5 py-3 transition-all"
              >
                <span className="text-blue-900 font-medium group-hover:text-blue-700">
                  {link.label}
                </span>
                <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t shadow-md">
          <ul className="flex flex-col p-6 gap-4 text-blue-900 font-semibold">

            <li>
              <Link to="/plans/Prepaid" onClick={() => setMobileOpen(false)}>
                Plans
              </Link>
            </li>

            <li>
              <Link to="/carriers" onClick={() => setMobileOpen(false)}>
                Carriers
              </Link>
            </li>

            <li>
              <Link to="/how-it-works" onClick={() => setMobileOpen(false)}>
                How it works
              </Link>
            </li>

            <li>
              <Link to="/contact" onClick={() => setMobileOpen(false)}>
                Contact
              </Link>
            </li>

            <hr />

            <li>
              <Link
                to="/login"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <LogIn className="w-4 h-4" /> Login
              </Link>
            </li>

            <li>
              <Link
                to="/signup"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </Link>
            </li>
          </ul>
        </div>
      )}

    </nav>
  );
}
