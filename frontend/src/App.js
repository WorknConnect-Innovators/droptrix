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
import PaymentForm from './pages/PlanActivation/paymentForm'
import AdminDashLayout from './layout/adminLayout'
import AdminCarrierPage from './AdminDashnoard/pages/carriers/carrierPage'
import AdminPlansPage from './AdminDashnoard/pages/plans/planspage'
import TopUp from './UserDashboard/pages/topup'
import PageNotFound from './components/pageNotFound'
import Dashboard from './pages/Dashboard'
import ActivateSim from './UserDashboard/pages/ActivateSim'
import AddFunds from './UserDashboard/pages/addFunds'
import AdminFunds from './AdminDashnoard/pages/AccountFunds/adminFunds'
import AdminTopups from './AdminDashnoard/pages/topups/adminTopups'
import AdminSimActivation from './AdminDashnoard/pages/simActivation/adminSimActivation'
import UsersPage from './AdminDashnoard/pages/Users/usersPage'
import AddAdmin from './AdminDashnoard/pages/Admin/addAdmin'
import UserChargesBulk from './AdminDashnoard/pages/Taxes/userChargesBulk'

function App() {

  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route path="*" element={<PageNotFound />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/companies/:companyName" element={<CompanyPage />} />
          <Route path="/plans/:choosenPlanType" element={<PlansPage />} />
          <Route path="/plans/:choosenCarrier" element={<PlansPage />} />
          <Route path="/paymentForm" element={<PaymentForm />} />
          <Route path="/carriers" element={<CarrierPage />} />
          <Route path="/contact" element={<ContactUs />} />
        </Route>

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<AdminDashLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="carriers" element={<AdminCarrierPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
          <Route path="topup" element={<TopUp />} />
          <Route path='approve-topups' element={<AdminTopups />} />
          <Route path='approve-activation' element={<AdminSimActivation />} />
          <Route path="activate-sim" element={<ActivateSim />} />
          <Route path="add-funds" element={<AddFunds />} />
          <Route path="user-funds" element={<AdminFunds />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="add-admin" element={<AddAdmin />} />
          <Route path='user-charges' element={<UserChargesBulk />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;


