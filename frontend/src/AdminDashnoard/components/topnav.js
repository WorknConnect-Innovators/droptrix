import React from "react";
import { MessageSquare, ChevronRight, Home, User, UserRound, LogOut } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

function AdminTopnav({ onEditProfile }) {
    const location = useLocation();
    const localUser = localStorage.getItem("userData")
    const user = localUser ? JSON.parse(localUser) : null;
    const [userModalOpen, setUserModalOpen] = React.useState(false);

    const BREADCRUMB_LABELS = {
        dashboard: "Dashboard",
        carriers: "Carriers",
        plans: "Plans",
        topup: "Top Up",
        "approve-topups": "Approve Topups",
        "approve-activation": "SIM Activations",
        "activate-sim": "Activate SIM",
        "add-funds": "Add Funds",
        "user-funds": "User Funds",
        users: "Users",
        "add-admin": "Add Admin",
        "user-charges": "User Charges",
        "user-details": "User Details",
        "chat-support": "Chat Support",
        "admin-chat-support": "Chat Support",
    };

    // Create breadcrumb path dynamically
    const pathSegments = location.pathname.split("/").filter(Boolean);

    return (
        <div className="w-full bg-white shadow-md md:px-10 md:py-3 p-4 flex items-center justify-between sticky top-0 z-40">

            <img src="/dropLogo.png" alt="logo" className="h-12 md:hidden block" />

            {/* Breadcrumb Section */}
            <div className="md:flex hidden items-center space-x-2 text-gray-600 text-sm font-medium">
                <Link to="/dashboard" className="flex items-center hover:text-blue-600">
                    <Home size={18} className="mr-1" />
                    Dashboard
                </Link>

                {pathSegments.map((segment, index) => {
                    const routeTo = `/${pathSegments.slice(0, index + 1).join("/")}`;
                    const label = BREADCRUMB_LABELS[segment];

                    // If route is not defined, don't show it
                    if (!label) return null;

                    const isLast = index === pathSegments.length - 1;

                    return (
                        <div key={index} className="flex items-center space-x-2">
                            <ChevronRight size={16} />
                            {isLast ? (
                                <span className="text-blue-600 font-semibold">
                                    {label}
                                </span>
                            ) : (
                                <Link to={routeTo} className="hover:text-blue-600">
                                    {label}
                                </Link>
                            )}
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

                {/* Profile */}
                <div className="relative">
                    <div onClick={() => setUserModalOpen(!userModalOpen)} className="flex items-center space-x-2 cursor-pointer bg-gray-100 shadow-inner hover:bg-gray-200 p-1 rounded-full transition">
                        <div className="w-9 h-9 rounded-full object-cover flex items-center justify-center bg-blue-500 text-white font-semibold">
                            {user ? user.full_name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <User size={18} className="text-gray-500 sm:hidden md:block" />
                    </div>

                    {userModalOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">

                            {/* User Info */}
                            <div className="px-4 py-3 border-b bg-gray-50">
                                <p className="font-semibold text-gray-800 truncate">
                                    {user ? user.full_name : "User"}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {user ? user.email : "user@example.com"}
                                </p>
                            </div>

                            {/* Actions */}
                            <div>
                                {/* Edit Profile */}
                                <div
                                    onClick={() => {
                                        setUserModalOpen(false);
                                        onEditProfile?.();
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 border-b cursor-pointer hover:bg-blue-50 transition group"
                                >
                                    <UserRound
                                        size={18}
                                        className="text-blue-500 group-hover:text-blue-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                                        Edit Profile
                                    </span>
                                </div>

                                {/* Logout */}
                                <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-red-50 transition group">
                                    <LogOut
                                        size={18}
                                        className="text-red-500 group-hover:text-red-600"
                                    />
                                    <span className="text-sm font-medium text-red-600 group-hover:text-red-700">
                                        Logout
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default AdminTopnav;
