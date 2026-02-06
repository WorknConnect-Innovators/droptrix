import { HomeIcon, LogOutIcon, FolderIcon, ChevronDown, ChevronRight, CompassIcon, BanknoteArrowUp, CircleDollarSign } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FaPlaneSlash, FaSimCard } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import { MdOutlineSupportAgent } from "react-icons/md";

function Sidebar() {
    const location = useLocation()
    const userType = localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).user_type : null;
    const [userNavLinks, setUserNavLinks] = useState([])
    const [isExpanded, setIsExpanded] = useState(false)
    const [activeRoute, setActiveRoute] = useState("")
    const [openSubmenu, setOpenSubmenu] = useState(false)

    const navLinks = [
        {
            label: "Home",
            icon: <HomeIcon size={26} />,
            hasaccess: ["user", "admin"],
            route: "/dashboard"
        },
        {
            label: "Add Funds",
            icon: <CircleDollarSign size={26} />,
            hasaccess: ["user"],
            route: "/dashboard/add-funds"
        },
        {
            label: "Top Up",
            icon: <BanknoteArrowUp size={26} />,
            hasaccess: ["user"],
            route: "/dashboard/topup"
        },
        {
            label: "Top Up",
            icon: <BanknoteArrowUp size={26} />,
            hasaccess: ["superadmin", "admin"],
            route: "/dashboard/approve-topups"
        },
        {
            label: "Activate Sim",
            icon: <FaSimCard size={26} />,
            hasaccess: ["user"],
            route: "/dashboard/activate-sim"
        },
        {
            label: "Activate Sim",
            icon: <FaSimCard size={26} />,
            hasaccess: ["superadmin", "admin"],
            route: "/dashboard/approve-activation"
        },
        {
            label: "User Funds",
            icon: <CircleDollarSign size={26} />,
            hasaccess: ["superadmin", "admin"],
            route: "/dashboard/user-funds"
        },
        {
            label: "Chat Support",
            icon: <MdOutlineSupportAgent size={26} />,
            hasaccess: ["user"],
            route: "/dashboard/chat-support"
        },
        {
            label: "Chat Support",
            icon: <MdOutlineSupportAgent size={26} />,
            hasaccess: ["superadmin", "admin"],
            route: "/dashboard/admin-chat-support"
        },
        {
            label: "Manage",
            icon: <FolderIcon size={26} />,
            hasaccess: ["admin", "superadmin"],
            submenu: [
                { label: "Companies", icon: <CompassIcon size={20} />, route: "/dashboard/carriers" },
                { label: "Plans", icon: <FaPlaneSlash size={20} />, route: "/dashboard/plans" },
                { label: "Users", icon: <HomeIcon size={20} />, route: "/dashboard/users" },
                { label: "Add Admin", icon: <HomeIcon size={20} />, route: "/dashboard/add-admin" },
                { label: "Bulk Charges", icon: <HomeIcon size={20} />, route: "/dashboard/user-charges" }
            ]
        }
    ]

    // Filter user-accessible links
    useEffect(() => {
        const filteredLinks = navLinks.filter(link => link.hasaccess.includes(userType))
        setUserNavLinks(filteredLinks)
    }, [userType])

    // Detect current active route based on pathname
    useEffect(() => {
        setActiveRoute(location.pathname)
        setOpenSubmenu(false)
    }, [location.pathname])

    return (
        <nav
            className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg
      flex flex-col items-start py-6 transition-all duration-300 ease-in-out z-50
      ${isExpanded ? 'w-64' : 'w-24'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => {
                setIsExpanded(false)
                setOpenSubmenu(false)
            }}
        >
            {/* Logo */}
            <div className="flex items-center justify-center w-full mb-8">
                <img
                    src="/logo.jpg"
                    alt="logo"
                    className="h-16 transition-all duration-300"
                />
            </div>

            {/* Navigation Links */}
            <div className={`flex flex-col w-full gap-y-3 ${isExpanded ? 'px-3' : 'items-center'}`}>
                {userNavLinks.map((link, index) => (
                    <React.Fragment key={index}>
                        <Link to={link.route}
                            onClick={() => {
                                if (link.submenu) setOpenSubmenu(!openSubmenu)
                            }}
                            className={`flex items-center justify-between px-6 py-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out
                hover:bg-blue-600 hover:text-white text-gray-700 group
                ${activeRoute === link.route ? 'bg-blue-600 text-white shadow-md' : ''}`}
                        >
                            <div className="flex items-center gap-x-4">
                                <div className={`transition-colors duration-300 ${activeRoute === link.route ? 'text-white' : 'text-gray-700 group-hover:text-white'}`}>{link.icon}</div>
                                {isExpanded && (
                                    <span className={`text-base font-medium transition-colors duration-300 ${activeRoute === link.route ? 'text-white' : 'text-gray-800 group-hover:text-white'}`}>
                                        {link.label}
                                    </span>
                                )}
                            </div>

                            {/* Chevron Icon */}
                            {isExpanded && link.submenu && (
                                openSubmenu ? (
                                    <ChevronDown size={20} className={`transition-colors duration-300 ${activeRoute === link.route ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                ) : (
                                    <ChevronRight size={20} className={`transition-colors duration-300 ${activeRoute === link.route ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                )
                            )}
                        </Link>

                        {/* Submenu */}
                        {link.submenu && openSubmenu && isExpanded && (
                            <div className="ml-4 mt-1 flex flex-col gap-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                {link.submenu.map((sub, subIndex) => (
                                    <Link to={sub.route}
                                        key={subIndex}
                                        className={`flex items-center gap-x-3 py-2 px-2 rounded-md cursor-pointer transition-all duration-300 ease-in-out
                      text-gray-600 hover:bg-blue-100 hover:text-blue-700
                      ${activeRoute === sub.route ? 'bg-blue-200 text-blue-700 font-medium shadow-sm' : ''}`}
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

            {/* Footer / Logout */}
            <div className="mt-auto w-full px-3 pb-4">
                <div
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    className="flex items-center gap-x-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
          hover:bg-red-600 hover:text-white text-gray-700 group"
                >
                    <LogOutIcon size={28} className="transition-colors duration-300 group-hover:text-white" />
                    {isExpanded && (
                        <span className="text-base font-medium transition-colors duration-300 text-gray-800 group-hover:text-white">
                            Logout
                        </span>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Sidebar
