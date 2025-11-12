import React from "react";
import { Bell, MessageSquare, ChevronRight, Home, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

function AdminTopnav() {
    const location = useLocation();

    // Create breadcrumb path dynamically
    const pathSegments = location.pathname.split("/").filter(Boolean);

    return (
        <div className="w-full bg-white shadow-md px-10 py-3 flex items-center justify-between sticky top-0 z-40">
            {/* Breadcrumb Section */}
            <div className="flex items-center space-x-2 text-gray-600 text-sm font-medium">
                <Link to="/home" className="flex items-center hover:text-blue-600">
                    <Home size={18} className="mr-1" />
                    Home
                </Link>

                {pathSegments.map((segment, index) => {
                    const routeTo = `/${pathSegments.slice(0, index + 1).join("/")}`;
                    const formatted = segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                        <div key={index} className="flex items-center space-x-2">
                            <ChevronRight size={16} />
                            <Link
                                to={routeTo}
                                className={`hover:text-blue-600 ${index === pathSegments.length - 1 ? "text-blue-600 font-semibold" : ""
                                    }`}
                            >
                                {formatted}
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-5">
                {/* Messages */}
                <div className="relative cursor-pointer hover:text-blue-600 transition">
                    <MessageSquare size={22} />
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full px-[5px] py-[1px]">
                        3
                    </span>
                </div>

                {/* Notifications */}
                <div className="relative cursor-pointer hover:text-blue-600 transition">
                    <Bell size={22} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-[5px] py-[1px]">
                        5
                    </span>
                </div>

                {/* Profile */}
                <div className="flex items-center space-x-2 cursor-pointer bg-gray-100 shadow-inner hover:bg-gray-200 p-1 rounded-full transition">
                    <div className="w-9 h-9 rounded-full object-cover flex items-center justify-center bg-blue-500 text-white font-semibold">
                        A
                    </div>
                    <User size={18} className="text-gray-500 sm:hidden md:block" />
                </div>
            </div>
        </div>
    );
}

export default AdminTopnav;
