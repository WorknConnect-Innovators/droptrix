import React, { useEffect, useState } from 'react'
import { Search, ListFilterIcon, Plus, X, ChevronLeft, ChevronRight, CircleDollarSign } from 'lucide-react'
import { message } from 'antd'

function AddAdmin() {
  const [admins, setAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('username')
  const filterOptions = [
    { label: 'Username', key: 'username' },
    { label: 'Full Name', key: 'full_name' },
    { label: 'Email', key: 'email' },
  ]
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentItems, setCurrentItems] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({ username: '', full_name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const loadAdmins = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-signup-data/`)
      const data = await res.json()
      if (data.status === 'success') {
        // filter to admins only (user_type === 'admin')
        const onlyAdmins = data.data.filter(u => u.user_type === 'admin')
        setAdmins(onlyAdmins)
      }
    } catch (err) { console.error(err) }
  }

  useEffect(() => { loadAdmins() }, [])

  const filteredData = React.useMemo(() => {
    return admins.filter(u => {
      const v = u[selectedFilter]
      if (v === undefined || v === null) return false
      return v.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [admins, selectedFilter, searchTerm])

  useEffect(() => {
    const last = currentPage * itemsPerPage
    const first = last - itemsPerPage
    setCurrentItems(filteredData.slice(first, last))
    setTotalPages(Math.max(1, Math.ceil(filteredData.length / itemsPerPage)))
  }, [filteredData, currentPage, itemsPerPage])

  useEffect(() => setCurrentPage(1), [searchTerm, selectedFilter])

  const validate = () => {
    const e = {}
    if (!formData.username) e.username = 'Required'
    if (!formData.full_name) e.full_name = 'Required'
    if (!formData.email) e.email = 'Required'
    if (!formData.password || formData.password.length < 6) e.password = 'Min 6 chars'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submitAdmin = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = { ...formData, user_type: 'admin' }
      const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/signup/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok) {
        message.success('Admin added')
        setShowAddModal(false)
        setFormData({ username: '', full_name: '', email: '', password: '' })
        loadAdmins()
      } else {
        message.error(data.message || data.error || 'Failed')
      }
    } catch (err) { console.error(err); message.error('Server error') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg py-4 overflow-hidden">
      <div className="bg-white z-20">
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center px-4 mb-4 gap-4">
          <div className="flex gap-x-3 items-center">
            <div className="bg-blue-100 p-2 w-fit rounded-xl shadow-inner">
              <CircleDollarSign className="text-blue-700" size={38} />
            </div>
            <div>
              <h1 className="text-gray-900 font-extrabold lg:text-xl md:text-lg text-base tracking-wide">Admins</h1>
              <p className="text-gray-400/80 font-medium italic lg:text-base md:text-sm text-xs">Manage platform administrators</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={16}/> Add Admin</button>

            <div className="relative">
              <div onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                <ListFilterIcon />
                <label className="cursor-pointer">Filters</label>
              </div>
              <div className="absolute z-50">
                {isFilterOpen && (
                  <div className="bg-white border border-gray-300 rounded shadow-md p-2">
                    {filterOptions.map(f => (
                      <div key={f.key} className={`cursor-pointer px-3 py-1 rounded ${selectedFilter === f.key ? 'bg-blue-500 text-white' : 'text-gray-700'}`} onClick={() => { setSelectedFilter(f.key); setIsFilterOpen(false) }}>{f.label}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input type="text" placeholder="Search admins..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:h-[59vh] h-[54vh] w-full">
        <div className="flex-1 overflow-y-auto w-full md:px-0 px-4">
          <table className="w-full text-sm text-gray-700 lg:inline-table hidden">
            <thead className="bg-blue-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="px-10 py-3 text-left">No</th>
                <th className="px-10 py-3 text-left">Username</th>
                <th className="px-10 py-3 text-left">Full Name</th>
                <th className="px-10 py-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                currentItems.slice().reverse().map((u, idx) => (
                  <tr key={u.username} className="border-t hover:bg-gray-50">
                    <td className="px-10 py-3 font-semibold">{idx <= 8 ? `0${idx + 1}` : idx + 1}</td>
                    <td className="px-10 py-3 font-semibold">{u.username}</td>
                    <td className="px-10 py-3">{u.full_name}</td>
                    <td className="px-10 py-3">{u.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-10 py-6 text-center text-gray-500">No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredData.slice().reverse().map((u, idx) => (
            <div key={u.username} className="md:hidden border rounded-xl shadow-sm p-4 mb-4 bg-white hover:shadow-md transition flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                <div className="text-gray-700 font-bold text-lg">#{idx + 1}</div>
                <div className="text-gray-500 text-sm">{u.username}</div>
              </div>
              <div className="text-gray-700 text-sm">{u.full_name}</div>
              <div className="text-gray-700 text-sm">{u.email}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2 sticky bottom-0 bg-white md:px-8 px-4 pt-3 z-20 border-t">
          <div className="text-gray-600 text-sm">Total Admins: {filteredData.length}</div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"><ChevronLeft size={18} className="text-gray-600"/></button>
              <div className="flex items-center gap-1">{Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button key={num} onClick={() => setCurrentPage(num)} className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm transition shadow-sm ${currentPage === num ? 'bg-indigo-100 text-indigo-600 border-indigo-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>{num}</button>
              ))}</div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"><ChevronRight size={18} className="text-gray-600"/></button>
            </div>
          )}
          <select className="border rounded-lg md:px-4 px-2 py-2 text-gray-600 text-sm md:block hidden" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}>
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-lg rounded-2xl shadow-lg relative p-6">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"><X size={22}/></button>
            <h2 className="text-xl font-semibold mb-4">Add Admin</h2>

            <div className="space-y-3 text-sm">
              <input type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className={`w-full border ${errors.username ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2`} />
              <input type="text" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className={`w-full border ${errors.full_name ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2`} />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={`w-full border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2`} />
              <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={`w-full border ${errors.password ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2`} />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={submitAdmin} disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{loading ? 'Adding...' : 'Add Admin'}</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 border rounded-lg py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddAdmin
