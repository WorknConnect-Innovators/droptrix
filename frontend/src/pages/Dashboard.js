import React from 'react'
import UserDashboard from '../UserDashboard/pages/userDashboard';
import AdminDashboard from '../AdminDashnoard/pages/adminDashboard';

function Dashboard() {

    const userType = localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).user_type : null;

    return (
        <>
            {userType === "user" ? (
                <UserDashboard />
            ) : (
                <AdminDashboard />
            )}
        </>
    )
}

export default Dashboard
