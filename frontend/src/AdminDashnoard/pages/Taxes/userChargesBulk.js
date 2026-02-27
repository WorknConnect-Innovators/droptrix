import React, { useEffect, useState } from 'react'
import { Search, ListFilterIcon, ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import { message } from 'antd'
import { getCarriersFromBackend } from '../../../utilities/getCarriers'
import { companyBasedPlans } from '../../../utilities/getPlans'

export default function UserChargesBulk() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('username')
  const filterOptions = [
    { label: 'Username', key: 'username' },
    { label: 'Full Name', key: 'full_name' },
    { label: 'Email', key: 'email' },
  ]

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [selectAllOnPage, setSelectAllOnPage] = useState(false)

  // Recharge charges & discounts
  const [rechargeCharges, setRechargeCharges] = useState('')
  const [rechargeDiscounts, setRechargeDiscounts] = useState('')
  const [savingRecharge, setSavingRecharge] = useState(false)

  // Carrier/Topup discounts
  const [carriers, setCarriers] = useState([])
  const [loadingCarriers, setLoadingCarriers] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState('')
  const [carrierDiscounts, setCarrierDiscounts] = useState('')
  const [savingCarrier, setSavingCarrier] = useState(false)

  // Plan/Activation discounts
  const [plansCarrier, setPlansCarrier] = useState('')
  const [plansData, setPlansData] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [planDiscount, setPlanDiscount] = useState('')
  const [savingPlan, setSavingPlan] = useState(false)

  const loadUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-signup-data/`)
      const data = await res.json()
      if (data.status === 'success') setUsers(data.data.filter(u => u.user_type === 'user'))
    } catch (err) { console.error(err) }
  }

  const loadCarriers = async () => {
    setLoadingCarriers(true)
    try {
      const result = await getCarriersFromBackend()
      setCarriers(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingCarriers(false)
    }
  }

  useEffect(() => {
    loadUsers()
    loadCarriers()
  }, [])

  useEffect(() => {
    if (plansCarrier) {
      const getPlans = async () => {
        setLoadingPlans(true)
        try {
          const result = await companyBasedPlans(plansCarrier)
          setPlansData(result)
        } catch (err) {
          console.error(err)
        } finally {
          setLoadingPlans(false)
        }
      }
      getPlans()
    }
  }, [plansCarrier])

  const filtered = React.useMemo(() => {
    return users.filter(u => {
      const v = u[selectedFilter]
      if (v === undefined || v === null) return false
      return v.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [users, selectedFilter, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => { setSelectAllOnPage(pageItems.every(u => selectedUsers.has(u.username))) }, [pageItems, selectedUsers])

  function toggleUser(username) {
    setSelectedUsers(prev => {
      const s = new Set(prev)
      if (s.has(username)) s.delete(username)
      else s.add(username)
      return s
    })
  }

  function toggleSelectAllOnPage() {
    setSelectedUsers(prev => {
      const s = new Set(prev)
      if (selectAllOnPage) {
        // unselect all on page
        pageItems.forEach(u => s.delete(u.username))
      } else {
        pageItems.forEach(u => s.add(u.username))
      }
      return s
    })
    setSelectAllOnPage(!selectAllOnPage)
  }

  const applyRechargeCharges = async () => {
    if (selectedUsers.size === 0) {
      message.error('Select at least one user')
      return
    }

    const Dr = Number(rechargeDiscounts)
    const Cr = Number(rechargeCharges)

    if (isNaN(Dr) || isNaN(Cr)) {
      message.error('Please enter valid numeric values for charges and discounts')
      return
    }

    setSavingRecharge(true)
    try {
      const usernames = Array.from(selectedUsers)
      let successCount = 0
      let failCount = 0

      for (const username of usernames) {
        try {
          const payload = {
            usernames: [username],
            recharge_charges: Cr,
            recharge_discount: Dr,
          }
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/update-charges-discount/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          const data = await res.json()
          if (data.status === 'success') {
            successCount++
          } else {
            failCount++
          }
        } catch (err) {
          failCount++
          console.error(err)
        }
      }

      if (successCount > 0) {
        message.success(`Recharge charges applied to ${successCount} user(s)`)
      }
      if (failCount > 0) {
        message.warning(`Failed for ${failCount} user(s)`)
      }

      setSelectedUsers(new Set())
      setSelectAllOnPage(false)
      loadUsers()
    } catch (err) {
      console.error(err)
      message.error('Server error')
    } finally {
      setSavingRecharge(false)
    }
  }

  const applyCarrierDiscount = async () => {
    if (selectedUsers.size === 0) {
      message.error('Select at least one user')
      return
    }

    if (!selectedCarrier) {
      message.error('Please select a carrier')
      return
    }

    const discount = Number(carrierDiscounts)
    if (isNaN(discount)) {
      message.error('Please enter a valid discount percentage')
      return
    }

    setSavingCarrier(true)
    try {
      const usernames = Array.from(selectedUsers)
      let successCount = 0
      let failCount = 0

      for (const username of usernames) {
        try {
          const payload = {
            username: username,
            company_id: selectedCarrier,
            discount_percentage: discount,
          }
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/add-company-offer/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          const data = await res.json()
          if (data.status === 'success') {
            successCount++
          } else {
            failCount++
          }
        } catch (err) {
          failCount++
          console.error(err)
        }
      }

      if (successCount > 0) {
        message.success(`Carrier discount applied to ${successCount} user(s)`)
      }
      if (failCount > 0) {
        message.warning(`Failed for ${failCount} user(s)`)
      }

      setSelectedUsers(new Set())
      setSelectAllOnPage(false)
    } catch (err) {
      console.error(err)
      message.error('Server error')
    } finally {
      setSavingCarrier(false)
    }
  }

  const applyPlanDiscount = async () => {
    if (selectedUsers.size === 0) {
      message.error('Select at least one user')
      return
    }

    if (!selectedPlan) {
      message.error('Please select a plan')
      return
    }

    const discount = Number(planDiscount)
    if (isNaN(discount)) {
      message.error('Please enter a valid discount percentage')
      return
    }

    setSavingPlan(true)
    try {
      const usernames = Array.from(selectedUsers)
      let successCount = 0
      let failCount = 0

      for (const username of usernames) {
        try {
          const payload = {
            username: username,
            plan_id: selectedPlan,
            discount_percentage: discount,
          }
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/add-user-offer/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          const data = await res.json()
          if (data.status === 'success') {
            successCount++
          } else {
            failCount++
          }
        } catch (err) {
          failCount++
          console.error(err)
        }
      }

      if (successCount > 0) {
        message.success(`Plan discount applied to ${successCount} user(s)`)
      }
      if (failCount > 0) {
        message.warning(`Failed for ${failCount} user(s)`)
      }

      setSelectedUsers(new Set())
      setSelectAllOnPage(false)
    } catch (err) {
      console.error(err)
      message.error('Server error')
    } finally {
      setSavingPlan(false)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg py-4 overflow-hidden">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Bulk User Charges & Discounts</h2>
          <p className="text-sm text-gray-500">Select multiple users and apply charges & discounts in one go</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <ListFilterIcon />
              <label>Filters</label>
            </div>
            <div className="absolute">{isFilterOpen && (
              <div className="bg-white border rounded shadow p-2">{filterOptions.map(f => (
                <div key={f.key} className={`px-2 py-1 cursor-pointer ${selectedFilter === f.key ? 'bg-blue-500 text-white' : 'text-gray-700'}`} onClick={() => { setSelectedFilter(f.key); setIsFilterOpen(false) }}>{f.label}</div>
              ))}</div>
            )}</div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input className="pl-10 pr-3 py-2 border rounded-lg" placeholder="Search users" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-left text-xs text-gray-600">
              <tr>
                <th className="px-3 py-2"><input type="checkbox" checked={pageItems.length > 0 && pageItems.every(u => selectedUsers.has(u.username))} onChange={toggleSelectAllOnPage} /></th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Full Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">User Type</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No users</td></tr>
              )}
              {pageItems.map(u => (
                <tr key={u.username} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2"><input type="checkbox" checked={selectedUsers.has(u.username)} onChange={() => toggleUser(u.username)} /></td>
                  <td className="px-3 py-2 font-semibold">{u.username}</td>
                  <td className="px-3 py-2">{u.full_name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.user_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between border-b pb-4">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Selected Users: </span>
            <span className="text-indigo-600">{selectedUsers.size}</span>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-2 py-1 border rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
            <div className="text-sm">{currentPage} / {totalPages}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-2 py-1 border rounded disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Section 1: Recharge Charges & Discounts */}
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-md font-semibold mb-3 text-gray-800">1. Recharge Charges & Discounts</h3>
          <p className="text-xs text-gray-500 mb-3">Apply recharge charges and discounts to selected users</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recharge Charges (%)</label>
              <input 
                type="number" 
                placeholder="Enter charge percentage" 
                value={rechargeCharges} 
                onChange={e => setRechargeCharges(e.target.value)} 
                className="w-full border rounded-md px-3 py-2" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recharge Discounts (%)</label>
              <input 
                type="number" 
                placeholder="Enter discount percentage" 
                value={rechargeDiscounts} 
                onChange={e => setRechargeDiscounts(e.target.value)} 
                className="w-full border rounded-md px-3 py-2" 
              />
            </div>
          </div>

          <button 
            onClick={applyRechargeCharges} 
            disabled={savingRecharge || selectedUsers.size === 0} 
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savingRecharge && <Loader className="animate-spin" size={16} />}
            {savingRecharge ? 'Applying...' : 'Apply Recharge Charges'}
          </button>
        </div>

        {/* Section 2: Carrier/Topup Discounts */}
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-md font-semibold mb-3 text-gray-800">2. Carrier/Topup Discounts</h3>
          <p className="text-xs text-gray-500 mb-3">Apply carrier-specific discounts for topup to selected users</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Carrier</label>
              {loadingCarriers ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="animate-spin" size={16} />
                  <span className="text-sm">Loading carriers...</span>
                </div>
              ) : (
                <select 
                  value={selectedCarrier} 
                  onChange={e => setSelectedCarrier(e.target.value)} 
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">-- Select Carrier --</option>
                  {carriers.map(c => (
                    <option key={c.company_id} value={c.company_id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrier Discount (%)</label>
              <input 
                type="number" 
                placeholder="Enter discount percentage" 
                value={carrierDiscounts} 
                onChange={e => setCarrierDiscounts(e.target.value)} 
                className="w-full border rounded-md px-3 py-2" 
              />
            </div>
          </div>

          <button 
            onClick={applyCarrierDiscount} 
            disabled={savingCarrier || selectedUsers.size === 0 || !selectedCarrier} 
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savingCarrier && <Loader className="animate-spin" size={16} />}
            {savingCarrier ? 'Applying...' : 'Apply Carrier Discount'}
          </button>
        </div>

        {/* Section 3: Plan/Activation Discounts */}
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-md font-semibold mb-3 text-gray-800">3. Plan/Activation Discounts</h3>
          <p className="text-xs text-gray-500 mb-3">Apply plan-specific discounts for activation to selected users</p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Carrier</label>
              {loadingCarriers ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="animate-spin" size={16} />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                <select 
                  value={plansCarrier} 
                  onChange={e => setPlansCarrier(e.target.value)} 
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">-- Select Carrier --</option>
                  {carriers.map(c => (
                    <option key={c.company_id} value={c.company_id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
              {loadingPlans ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="animate-spin" size={16} />
                  <span className="text-sm">Loading plans...</span>
                </div>
              ) : (
                <select 
                  value={selectedPlan} 
                  onChange={e => setSelectedPlan(e.target.value)} 
                  className="w-full border rounded-md px-3 py-2"
                  disabled={!plansCarrier}
                >
                  <option value="">-- Select Plan --</option>
                  {plansData.map(p => (
                    <option key={p.plan_id} value={p.plan_id}>{p.plan_name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Discount (%)</label>
              <input 
                type="number" 
                placeholder="Enter discount percentage" 
                value={planDiscount} 
                onChange={e => setPlanDiscount(e.target.value)} 
                className="w-full border rounded-md px-3 py-2" 
              />
            </div>
          </div>

          <button 
            onClick={applyPlanDiscount} 
            disabled={savingPlan || selectedUsers.size === 0 || !selectedPlan} 
            className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savingPlan && <Loader className="animate-spin" size={16} />}
            {savingPlan ? 'Applying...' : 'Apply Plan Discount'}
          </button>
        </div>
      </div>
    </div>
  )
}
