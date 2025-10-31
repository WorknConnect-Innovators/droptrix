import React from 'react'
import Navbar from '../components/Navbar/navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../components/footer'

function MainLayout() {
    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    )
}

export default MainLayout
