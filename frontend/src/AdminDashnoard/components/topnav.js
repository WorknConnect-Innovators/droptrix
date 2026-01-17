import React from "react";
import { Bell, MessageSquare, ChevronRight, Home, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

function AdminTopnav() {
    const location = useLocation();
    const localUser = localStorage.getItem("userData")
    const user = localUser ? JSON.parse(localUser) : null;
    const [userModalOpen, setUserModalOpen] = React.useState(false);

    // Create breadcrumb path dynamically
    const pathSegments = location.pathname.split("/").filter(Boolean);

    return (
        <div className="w-full bg-white shadow-md md:px-10 md:py-3 p-4 flex items-center justify-between sticky top-0 z-40">

            <img src="/dropLogo.png" alt="logo" className="h-12 md:hidden block" />

            {/* Breadcrumb Section */}
            <div className="md:flex hidden items-center space-x-2 text-gray-600 text-sm font-medium">
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
            <div className="items-center space-x-5 flex">
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
                <div className="relative">
                    <div onClick={() => setUserModalOpen(!userModalOpen)} className="flex items-center space-x-2 cursor-pointer bg-gray-100 shadow-inner hover:bg-gray-200 p-1 rounded-full transition">
                        <div className="w-9 h-9 rounded-full object-cover flex items-center justify-center bg-blue-500 text-white font-semibold">
                            {user ? user.full_name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <User size={18} className="text-gray-500 sm:hidden md:block" />
                    </div>

                    {userModalOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                            <div className="p-4 border-b">
                                <p className="font-semibold">{user ? user.full_name : "User"}</p>
                                <p className="text-sm text-gray-500">{user ? user.email : "user@example.com"}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminTopnav;
