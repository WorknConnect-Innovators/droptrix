import React from 'react'
import HomePage from './pages/Home/home'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/Signup/signup'
import CompanyPage from './pages/Companies/companyPage'
import MainLayout from './layout/mainLayout'
import PlansPage from './pages/Plans/plansPage'
import ContactUs from './pages/Contact/contactus'
import Login from './pages/Login/login'
import CarrierPage from './pages/Companies/carrierPage'
import ScrollToTop from './components/scrolltop'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<MainLayout />} >
          <Route index element={<HomePage />} />
          <Route path='*' element={<h1 className='text-center mt-20 text-3xl'>404 Not Found</h1>} />
          <Route path='/companies/:companyName' element={<CompanyPage />} />
          <Route path='/plans/:choosenPlanType' element={<PlansPage />} />
          <Route path='/carriers' element={<CarrierPage />} />
          <Route path='/contact' element={<ContactUs />} />
        </Route>
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
