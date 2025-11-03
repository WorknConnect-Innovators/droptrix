import { HomeIcon, LayoutDashboardIcon, LogOutIcon, FolderIcon, UsersIcon, ChevronDown, ChevronRight, CompassIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FaPlaneSlash } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function Sidebar() {
    const user = "Admin"
    const [userNavLinks, setUserNavLinks] = useState([])
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedLink, setSelectedLink] = useState("Home")
    const [openSubmenu, setOpenSubmenu] = useState(false) // 👈 for "Manage" toggle

    const navLinks = [
        {
            label: "Dashboard",
            icon: <LayoutDashboardIcon size={26} />,
            hasaccess: ["Super Admin", "Admin"]
        },
        {
            label: "Home",
            icon: <HomeIcon size={26} />,
            hasaccess: ["Admin", "User"],
            route: "/dashboard/carriers"
        },
        {
            label: "Manage",
            icon: <FolderIcon size={26} />,
            hasaccess: ["Admin", "Super Admin"],
            submenu: [
                { label: "Companies", icon: <CompassIcon size={20} />, route: "/dashboard/carriers" },
                { label: "Plans", icon: <FaPlaneSlash size={20} />, route: "/dashboard/plans" },
                { label: "Settings", icon: <HomeIcon size={20} />, route: "/dashboard/settings" }
            ]
        }
    ]

    // Filter user-accessible links
    useEffect(() => {
        const filteredLinks = navLinks.filter(link => link.hasaccess.includes(user))
        setUserNavLinks(filteredLinks)
    }, [user])

    // Detect current active route
    useEffect(() => {
        const getCurrentOutlet = () => {
            const currentUrl = window.location.href.toLowerCase();
            switch (true) {
                case currentUrl.includes("dashboard"):
                    return "Dashboard";
                case currentUrl.includes("home"):
                    return "Home";
                case currentUrl.includes("projects"):
                    return "Projects";
                case currentUrl.includes("settings"):
                    return "Settings";
                case currentUrl.includes("users"):
                    return "Users";
                default:
                    return "Home";
            }
        };
        setSelectedLink(getCurrentOutlet());
    }, []);

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
                    src="logo.jpg"
                    alt="logo"
                    className="h-16 transition-all duration-300"
                />
            </div>

            {/* Navigation Links */}
            <div className={`flex flex-col w-full gap-y-3 ${isExpanded ? 'px-3' : 'items-center'}`}>
                {userNavLinks.map((link, index) => (
                    <React.Fragment key={index}>
                        <div
                            onClick={() => {
                                if (link.submenu) setOpenSubmenu(!openSubmenu)
                                else setSelectedLink(link.label)
                            }}
                            className={`flex items-center justify-between px-6 py-3 rounded-lg cursor-pointer transition-all duration-200
                hover:bg-blue-600 hover:text-white text-gray-700 group
                ${selectedLink === link.label ? 'bg-blue-600 text-white' : ''}`}
                        >
                            <Link to={link.route} className="flex items-center gap-x-4">
                                <div className="group-hover:text-white">{link.icon}</div>
                                {isExpanded && (
                                    <span className={`text-base font-medium ${selectedLink === link.label ? 'text-white' : 'text-gray-800'} group-hover:text-white`}>
                                        {link.label}
                                    </span>
                                )}
                            </Link>

                            {/* Chevron Icon */}
                            {isExpanded && link.submenu && (
                                openSubmenu ? (
                                    <ChevronDown size={20} className="text-gray-500 group-hover:text-white transition" />
                                ) : (
                                    <ChevronRight size={20} className="text-gray-500 group-hover:text-white transition" />
                                )
                            )}
                        </div>

                        {/* Submenu */}
                        {link.submenu && openSubmenu && isExpanded && (
                            <div className="ml-4 mt-1 flex flex-col gap-y-2">
                                {link.submenu.map((sub, subIndex) => (
                                    <Link to={sub.route}
                                        key={subIndex}
                                        onClick={() => setSelectedLink(sub.label)}
                                        className={`flex items-center gap-x-3 py-2 px-2 rounded-md cursor-pointer
                      text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200
                      ${selectedLink === sub.label ? 'bg-blue-200 text-blue-700 font-medium' : ''}`}
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
                    className="flex items-center gap-x-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
          hover:bg-red-600 hover:text-white text-gray-700 group"
                >
                    <LogOutIcon size={28} className="group-hover:text-white" />
                    {isExpanded && (
                        <span className="text-base font-medium text-gray-800 group-hover:text-white transition-colors duration-200">
                            Logout
                        </span>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Sidebar
