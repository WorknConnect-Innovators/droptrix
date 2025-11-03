import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../AdminDashnoard/components/sidebar";
import AdminTopnav from "../AdminDashnoard/components/topnav";

const AdminDashLayout = () => {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-20 transition-all duration-300">
                <AdminTopnav />
                <div className="px-10 py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminDashLayout;
