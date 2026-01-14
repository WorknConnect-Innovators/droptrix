import { X, Menu } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HomeIcon, LogOutIcon, FolderIcon, ChevronDown, ChevronRight, CompassIcon, BanknoteArrowUp, CircleDollarSign } from 'lucide-react'
import { FaPlaneSlash, FaSimCard } from 'react-icons/fa'
import { MdOutlineSupportAgent } from "react-icons/md";

function MobileSidebar() {
    const Navigate = useNavigate();
    const userType = localStorage.getItem("userData")
        ? JSON.parse(localStorage.getItem("userData")).user_type
        : null;

    const [open, setOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(false);
    const [selectedLink, setSelectedLink] = useState("Home");
    const [userNavLinks, setUserNavLinks] = useState([]);

    const navLinks = [
        {
            label: "Home",
            icon: <HomeIcon size={24} />,
            hasaccess: ["user", "admin"],
            route: "/dashboard",
        },
        {
            label: "Add Funds",
            icon: <CircleDollarSign size={24} />,
            hasaccess: ["user"],
            route: "/dashboard/add-funds",
        },
        {
            label: "Top Up",
            icon: <BanknoteArrowUp size={24} />,
            hasaccess: ["user"],
            route: "/dashboard/topup",
        },
        {
            label: "Top Up",
            icon: <BanknoteArrowUp size={24} />,
            hasaccess: ["superadmin", "admin"],
            route: "/dashboard/approve-topups",
        },
        {
            label: "Activate Sim",
            icon: <FaSimCard size={24} />,
            hasaccess: ["user"],
            route: "/dashboard/activate-sim",
        },
        {
            label: "Activate Sim",
            icon: <FaSimCard size={24} />,
            hasaccess: ["superadmin", "admin"],
            route: "/dashboard/approve-activation",
        },
        {
            label: "User Funds",
            icon: <CircleDollarSign size={24} />,
            hasaccess: ["superadmin", "admin"],
            route: "/dashboard/user-funds",
        },
        {
            label: "Chat Support",
            icon: <MdOutlineSupportAgent size={24} />,
            hasaccess: ["user"],
            route: "/dashboard/chat-support",
        },
        {
            label: "Chat Support",
            icon: <MdOutlineSupportAgent size={24} />,
            hasaccess: ["superadmin", "admin"],
            route: "/dashboard/admin-chat-support",
        },
        {
            label: "Manage",
            icon: <FolderIcon size={24} />,
            hasaccess: ["admin", "superadmin"],
            submenu: [
                { label: "Companies", icon: <CompassIcon size={18} />, route: "/dashboard/carriers" },
                { label: "Plans", icon: <FaPlaneSlash size={18} />, route: "/dashboard/plans" },
                { label: "Users", icon: <HomeIcon size={18} />, route: "/dashboard/users" },
                { label: "Add Admin", icon: <HomeIcon size={18} />, route: "/dashboard/add-admin" },
                { label: "Bulk Charges", icon: <HomeIcon size={18} />, route: "/dashboard/user-charges" }
            ]
        }
    ];

    // Filter user-accessible links
    useEffect(() => {
        const filteredLinks = navLinks.filter(link => link.hasaccess.includes(userType));
        setUserNavLinks(filteredLinks);
    }, [userType]);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="lg:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-lg shadow-md z-[999]"
                onClick={() => setOpen(true)}
            >
                <Menu size={28} />
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-[998]"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-[999] flex flex-col 
                transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <img src="/logo.jpg" alt="" className="h-12" />
                    <button onClick={() => setOpen(false)}>
                        <X size={28} className="text-gray-700" />
                    </button>
                </div>

                {/* Nav Links */}
                <div className="flex flex-col gap-2 p-4 overflow-y-auto">
                    {userNavLinks.map((link, index) => (
                        <React.Fragment key={index}>
                            <div
                                onClick={() => {
                                    if (link.submenu) setOpenSubmenu(prev => !prev);
                                    else {
                                        Navigate(link.route);
                                        setSelectedLink(link.label);
                                        setOpen(false);
                                    }
                                }}
                                className={`flex justify-between items-center py-3 px-4 rounded-lg cursor-pointer
                                ${selectedLink === link.label ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-blue-100"}`}
                            >
                                <div className="flex items-center gap-3">
                                    {link.icon}
                                    <span className="text-lg">{link.label}</span>
                                </div>

                                {link.submenu && (
                                    openSubmenu ? (
                                        <ChevronDown size={20} />
                                    ) : (
                                        <ChevronRight size={20} />
                                    )
                                )}
                            </div>

                            {/* Submenu */}
                            {link.submenu && openSubmenu && (
                                <div className="ml-8 flex flex-col gap-2">
                                    {link.submenu.map((sub, i) => (
                                        <Link
                                            key={i}
                                            to={sub.route}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
                                        >
                                            {sub.icon}
                                            <span className="text-sm">{sub.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Logout */}
                <div className="mt-auto p-4">
                    <div
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "/login";
                        }}
                        className="flex items-center gap-3 py-3 px-4 rounded-lg bg-red-600 text-white cursor-pointer"
                    >
                        <LogOutIcon size={22} />
                        <span className="text-base">Logout</span>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MobileSidebar;
