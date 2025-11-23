import React, { useEffect, useState } from 'react'
import { Search, ListFilterIcon, ChevronLeft, ChevronRight, CircleDollarSign } from 'lucide-react'
import { message } from 'antd'

function UsersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [isUserChargesOpen, setIsUserChargesOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [charges, setCharges] = useState({ topup: '', recharge: '', sim_activation: '' })
    const [discounts, setDiscounts] = useState({ topup: '', recharge: '', sim_activation: '' })
    const [saving, setSaving] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState('username');
    const filterOptions = [
        { label: 'Username', key: 'username' },
        { label: 'Full Name', key: 'full_name' },
        { label: 'Email', key: 'email' },
        { label: 'User Type', key: 'user_type' },
    ];
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const loadUsers = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-signup-data/`);
            const data = await res.json();
            const filterData = data.data.filter(user => user.user_type === 'user');
            if (data.status === 'success') setUsers(filterData);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredData = React.useMemo(() => {
        return users.filter((u) => {
            const value = u[selectedFilter];
            if (value === undefined || value === null) return false;
            return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [users, selectedFilter, searchTerm]);

    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem));
        setTotalPages(Math.max(1, Math.ceil(filteredData.length / itemsPerPage)));
    }, [filteredData, currentPage, itemsPerPage]);

    useEffect(() => setCurrentPage(1), [searchTerm, selectedFilter]);

    const handleSaveCharges = async () => {
        if (!selectedUser) return
        const Ct = Number(charges.topup)
        const Cr = Number(charges.recharge)
        const Cs = Number(charges.sim_activation)
        const Dt = Number(discounts.topup)
        const Dr = Number(discounts.recharge)
        const Ds = Number(discounts.sim_activation)
        if (isNaN(Ct) || isNaN(Cr) || isNaN(Cs) || isNaN(Dt) || isNaN(Dr) || isNaN(Ds)) { message.error('Please enter valid numeric values for taxes'); return }

        setSaving(true)
        try {
            const payload =
            {
                usernames: [selectedUser.username],
                topup_charges: Ct,
                recharge_charges: Cr,
                sim_activation_charges: Cs,
                topup_discount: Dt,
                recharge_discount: Dr,
                sim_activation_discount: Ds
            }
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/update-charges-discount/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            const data = await res.json()
            if (data.status === 'success') {
                message.success('Charges updated successfully')
                setIsUserChargesOpen(false)
                setSelectedUser(null)
                loadUsers()
            } else {
                message.error(data.message || 'Failed to update charges')
            }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setSaving(false) }
    }

    const loadDiscountCharges = async (user) => {
        setSelectedUser(user);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-charges-discount/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user.username })
                })
            const data = await res.json()
            if (data.status === 'success') {
                const receivedData = data?.data_received || {}

                setDiscounts({
                    topup: receivedData.topup_discount || '',
                    recharge: receivedData.recharge_discount || '',
                    sim_activation: receivedData.sim_activation_discount || ''
                })

                setCharges({
                    topup: receivedData.topup_charges || '',
                    recharge: receivedData.recharge_charges || '',
                    sim_activation: receivedData.sim_activation_charges || ''
                })

                setIsUserChargesOpen(true);
            }

        }
        catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="bg-white shadow-lg rounded-lg py-4 overflow-hidden" >
            <div className="bg-white z-20">
                <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center px-4 mb-4 gap-4">
                    <div className="flex gap-x-3 items-center">
                        <div className="bg-blue-100 p-2 w-fit rounded-xl shadow-inner">
                            <CircleDollarSign className="text-blue-700" size={38} />
                        </div>

                        <div>
                            <h1 className="text-gray-900 font-extrabold lg:text-xl md:text-lg text-base tracking-wide">Users</h1>
                            <p className="text-gray-400/80 font-medium italic lg:text-base md:text-sm text-xs">All registered users on the platform</p>
                        </div>
                    </div>
                </div>

                <hr className="py-2" />

                <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 px-4 pb-5">
                    <div className="border rounded-lg text-sm w-fit">
                        <button className={`rounded-l-lg px-4 py-2 border-r ${'bg-transparent'}`}>All</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                                <ListFilterIcon />
                                <label className="cursor-pointer">Filters</label>
                            </div>
                            <div className="absolute z-50">
                                {isFilterOpen && (
                                    <div className="bg-white border border-gray-300 rounded shadow-md p-2">
                                        {filterOptions.map((f) => (
                                            <div key={f.key} className={`cursor-pointer px-3 py-1 rounded ${selectedFilter === f.key ? 'bg-blue-500 text-white' : 'text-gray-700'}`} onClick={() => { setSelectedFilter(f.key); setIsFilterOpen(false); }}>
                                                {f.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {isUserChargesOpen ? (
                <div className="flex flex-col md:h-[59vh] h-[54vh] w-full">
                    <div className="flex-1 overflow-y-auto w-full md:px-20 px-4">
                        <div className='grid md:grid-cols-2 gap-6'>
                            <div>
                                <h3 className='font-semibold mb-2'>Personal Information</h3>
                                <div className='space-y-3'>
                                    <div>
                                        <label className='text-sm font-semibold'>Username</label>
                                        <input type="text" value={selectedUser.username} readOnly className='w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2' />
                                    </div>
                                    <div>
                                        <label className='text-sm font-semibold'>Full Name</label>
                                        <input type="text" value={selectedUser.full_name} readOnly className='w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2' />
                                    </div>
                                    <div>
                                        <label className='text-sm font-semibold'>Email</label>
                                        <input type="text" value={selectedUser.email} readOnly className='w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2' />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className='font-semibold mb-2'>Charges Information (Tax rates %)</h3>
                                <div className='space-y-3'>
                                    <div>
                                        <label className='text-sm font-semibold'>Topup Tax (%)</label>
                                        <input type="text" value={charges.topup} onChange={e => setCharges({ ...charges, topup: e.target.value })} placeholder='e.g. 2.5' className='w-full border rounded-md px-3 py-2' />
                                    </div>
                                    <div>
                                        <label className='text-sm font-semibold'>Recharge Tax (%)</label>
                                        <input type="text" value={charges.recharge} onChange={e => setCharges({ ...charges, recharge: e.target.value })} placeholder='e.g. 1.0' className='w-full border rounded-md px-3 py-2' />
                                    </div>
                                    <div>
                                        <label className='text-sm font-semibold'>SIM Activation Tax (%)</label>
                                        <input type="text" value={charges.sim_activation} onChange={e => setCharges({ ...charges, sim_activation: e.target.value })} placeholder='e.g. 0.5' className='w-full border rounded-md px-3 py-2' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-6'>
                            <h3 className='font-semibold mb-2'>Discounts (optional %)</h3>
                            <div className='grid md:grid-cols-3 gap-4'>
                                <div>
                                    <label className='text-sm font-semibold'>Topup Discount (%)</label>
                                    <input type="text" value={discounts.topup} onChange={e => setDiscounts({ ...discounts, topup: e.target.value })} placeholder='e.g. 10' className='w-full border rounded-md px-3 py-2' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold'>Recharge Discount (%)</label>
                                    <input type="text" value={discounts.recharge} onChange={e => setDiscounts({ ...discounts, recharge: e.target.value })} placeholder='e.g. 5' className='w-full border rounded-md px-3 py-2' />
                                </div>
                                <div>
                                    <label className='text-sm font-semibold'>SIM Activation Discount (%)</label>
                                    <input type="text" value={discounts.sim_activation} onChange={e => setDiscounts({ ...discounts, sim_activation: e.target.value })} placeholder='e.g. 0' className='w-full border rounded-md px-3 py-2' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex gap-3 items-center justify-end mt-4 md:px-20 px-4'>
                        <button onClick={() => { setIsUserChargesOpen(false); setSelectedUser(null); }} className='px-4 py-2 rounded-lg border'>Cancel</button>
                        <button onClick={handleSaveCharges} disabled={saving} className='px-4 py-2 rounded-lg bg-green-600 text-white'>{saving ? 'Saving...' : 'Save Charges'}</button>
                    </div>
                    <p className='text-xs text-gray-500 mt-3 md:px-20 px-4'>Note: Discounts are stored locally in your browser because the backend currently only stores charge fields.</p>
                </div>
            ) : (
                <div className="flex flex-col md:h-[59vh] h-[54vh] w-full">
                    <div className="flex-1 overflow-y-auto w-full md:px-0 px-4">
                        <table className="w-full text-sm text-gray-700 lg:inline-table hidden">
                            <thead className="bg-blue-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                                <tr>
                                    <th className="px-10 py-3 text-left">No</th>
                                    <th className="px-10 py-3 text-left">Username</th>
                                    <th className="px-10 py-3 text-left">Full Name</th>
                                    <th className="px-10 py-3 text-left">Email</th>
                                    <th className="px-10 py-3 text-left">User Type</th>
                                    <th className="px-10 py-3 text-left">Actions</th>
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
                                            <td className="px-10 py-3">{u.user_type}</td>
                                            <td>
                                                <button
                                                    onClick={() => loadDiscountCharges(u)}
                                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">Charges</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-10 py-6 text-center text-gray-500">No results found.</td>
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

                                <div className="text-gray-700 text-sm">{u.user_type}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-2 sticky bottom-0 bg-white md:px-8 px-4 pt-3 z-20 border-t">
                        <div className="text-gray-600 text-sm">Total Users: {filteredData.length}</div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"><ChevronLeft size={18} className="text-gray-600" /></button>
                                <div className="flex items-center gap-1">{Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                    <button key={num} onClick={() => setCurrentPage(num)} className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm transition shadow-sm ${currentPage === num ? 'bg-indigo-100 text-indigo-600 border-indigo-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>{num}</button>
                                ))}</div>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"><ChevronRight size={18} className="text-gray-600" /></button>
                            </div>
                        )}

                        <select className="border rounded-lg md:px-4 px-2 py-2 text-gray-600 text-sm md:block hidden" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                            <option value="10">10 / page</option>
                            <option value="25">25 / page</option>
                            <option value="50">50 / page</option>
                            <option value="100">100 / page</option>
                        </select>
                    </div>
                </div>
            )}

        </div >
    )
}

export default UsersPage
