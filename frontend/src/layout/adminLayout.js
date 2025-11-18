import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../AdminDashnoard/components/sidebar";
import AdminTopnav from "../AdminDashnoard/components/topnav";

const AdminDashLayout = () => {

    const location = useLocation();
    const CurrentUser = location?.state?.userData;

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <div className="md:block hidden">
                <Sidebar userType={CurrentUser?.user_type} />
            </div>
            <main className="flex-1 md:ml-20 ml-0 transition-all duration-300">
                <AdminTopnav />
                <div className="md:px-10 px-4 py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminDashLayout;
