import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../AdminDashnoard/components/sidebar";
import AdminTopnav from "../AdminDashnoard/components/topnav";
import MobileSidebar from "../AdminDashnoard/components/mobileSidebar";
import SettingsDrawer from "../AdminDashnoard/components/settingsDrawer";

const AdminDashLayout = () => {

    const location = useLocation();
    const CurrentUser = location?.state?.userData;
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <MobileSidebar />
            <div className="md:block hidden">
                <Sidebar userType={CurrentUser?.user_type} />
            </div>
            <main className="flex-1 md:ml-20 ml-0 transition-all duration-300">
                <AdminTopnav onEditProfile={() => setSettingsOpen(true)} />
                <div className="md:px-10 px-4 py-6 overflow-x-hidden">
                    <Outlet />
                </div>
            </main>

            <SettingsDrawer
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </div>
    );
};

export default AdminDashLayout;
