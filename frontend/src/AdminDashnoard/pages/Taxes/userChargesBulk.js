import React, { useEffect, useState } from 'react'
import { Search, ListFilterIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { message } from 'antd'

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

  const [charges, setCharges] = useState({ topup: '', recharge: '', sim_activation: '' })
  const [discounts, setDiscounts] = useState({ topup: '', recharge: '', sim_activation: '' })
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-signup-data/`)
      const data = await res.json()
      if (data.status === 'success') setUsers(data.data.filter(u => u.user_type === 'user'))
    } catch (err) { console.error(err) }
  }

  useEffect(() => { loadUsers() }, [])

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

  const applyBulk = async () => {
    if (selectedUsers.size === 0) { message.error('Select at least one user'); return }
    const t = Number(charges.topup)
    const r = Number(charges.recharge)
    const s = Number(charges.sim_activation)
    const dt = Number(discounts.topup)
    const dr = Number(discounts.recharge)
    const ds = Number(discounts.sim_activation)
    if (isNaN(t) || isNaN(r) || isNaN(s) || isNaN(dt) || isNaN(dr) || isNaN(ds)) { message.error('Enter valid numeric tax rates and discounts'); return }

    setSaving(true)
    try {
      const usernames = Array.from(selectedUsers)
      const payload = {
        usernames,
        topup_charges: t,
        recharge_charges: r,
        sim_activation_charges: s,
        topup_discount: dt,
        recharge_discount: dr,
        sim_activation_discount: ds
      }
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/update-charges-discount/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.status === 'success') {
        // save discounts locally per user until backend supports discount fields
        try {
          const stored = JSON.parse(localStorage.getItem('user_discounts') || '{}')
          usernames.forEach(u => { stored[u] = discounts })
          localStorage.setItem('user_discounts', JSON.stringify(stored))
        } catch (err) { /* ignore localStorage errors */ }

        message.success('Applied charges to selected users')
        setSelectedUsers(new Set())
        setSelectAllOnPage(false)
        loadUsers()
      } else {
        message.error(data.message || 'Failed to apply charges')
      }
    } catch (err) { console.error(err); message.error('Server error') }
    finally { setSaving(false) }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg py-4 overflow-hidden">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Bulk User Charges</h2>
          <p className="text-sm text-gray-500">Select multiple users and apply taxes & discounts in one go</p>
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

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold">Charges to apply (Tax rates %)</div>
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Topup %" value={charges.topup} onChange={e => setCharges({...charges, topup: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              <input placeholder="Recharge %" value={charges.recharge} onChange={e => setCharges({...charges, recharge: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              <input placeholder="SIM Activation %" value={charges.sim_activation} onChange={e => setCharges({...charges, sim_activation: e.target.value})} className="w-full border rounded-md px-3 py-2" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Discounts to apply (optional %)</div>
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Topup %" value={discounts.topup} onChange={e => setDiscounts({...discounts, topup: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              <input placeholder="Recharge %" value={discounts.recharge} onChange={e => setDiscounts({...discounts, recharge: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              <input placeholder="SIM Activation %" value={discounts.sim_activation} onChange={e => setDiscounts({...discounts, sim_activation: e.target.value})} className="w-full border rounded-md px-3 py-2" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button onClick={applyBulk} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded">{saving ? 'Applying...' : 'Apply to selected users'}</button>
            <div className="text-sm text-gray-500">Selected: {selectedUsers.size}</div>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-2 py-1 border rounded"><ChevronLeft size={16} /></button>
            <div className="text-sm">{currentPage} / {totalPages}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-2 py-1 border rounded"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
