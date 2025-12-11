import React, { useEffect, useState } from "react";
import { Search, X, ListFilterIcon, ChevronLeft, ChevronRight, CircleDollarSign } from "lucide-react";

function AdminSimActivation() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activationData, setActivationData] = useState([]);
    const [selectedActivation, setSelectedActivation] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});

    const [selectedFilter, setSelectedFilter] = useState("plan_id");
    const filterOptions = [
        { label: "Plan", key: "plan_id" },
        { label: "Amount", key: "amount_charged" },
        { label: "Phone No", key: "phone_no" },
    ];
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [preFilter, setPreFilter] = useState('all');

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    // Load activation data
    const loadData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-activation-data/`);
            const data = await res.json();
            if (data.status === "success") {
                setActivationData(data.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtered data (unsorted)
    const filteredData = React.useMemo(() => {
        return activationData
            .filter((item) => {
                if (preFilter === 'approved' && item.pending !== 'Approved') return false;
                if (preFilter === 'pending' && item.pending !== 'Pending') return false;
                if (preFilter === 'cancelled' && item.pending !== 'Canceled' && item.pending !== 'Cancelled') return false; // tolerate both spellings
                return true;
            })
            .filter((item) => {
                const key = selectedFilter;
                let value = item[key];
                if (key === 'timestamp' && value) value = new Date(value).toLocaleString();
                if (value === undefined || value === null) return false;
                return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [activationData, selectedFilter, searchTerm, preFilter]);

    // Pagination: reverse once (to get newest-first) then paginate the reversed list
    useEffect(() => {
        // create reversed (newest-first) array
        const sorted = filteredData.slice().reverse();

        const computedTotalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
        setTotalPages(computedTotalPages);

        // clamp currentPage if it went out of range after filtering/search
        const clampedPage = Math.min(currentPage, computedTotalPages);
        if (clampedPage !== currentPage) setCurrentPage(clampedPage);

        const indexOfLastItem = clampedPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        setCurrentItems(sorted.slice(indexOfFirstItem, indexOfLastItem));
    }, [filteredData, currentPage, itemsPerPage]);

    // whenever user changes search/filter, reset to page 1 (and clamp will handle edge cases)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFilter, preFilter, itemsPerPage]);

    const approveActivation = async () => {
        if (!selectedActivation) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/approve-activation/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activation_id: selectedActivation.activation_id, username: selectedActivation.username }),
            });
            const data = await res.json();
            if (data.status === 'success') {
                alert('Activation approved');
                setShowApproveModal(false);
                setSelectedActivation(null);
                loadData();
            }
        } catch (err) {
            console.error(err);
            alert('Error approving activation');
        }
    };

    // --- Admin edit handlers ---
    const startEdit = (item) => {
        setSelectedActivation(item);
        setEditForm({
            activation_id: item.activation_id,
            username: item.username,
            email: item.email || "",
            phone_no: item.phone_no || "",
            simNumber: item.simNumber || "",
            eid: item.eid || "",
            iccid: item.iccid || "",
            postal_code: item.postal_code || 0,
            pin_code: item.pin_code || 0,
            emi: item.emi || "",
            amount_charged: item.amount_charged || item.amount || 0,
            amount: item.amount || item.amount_charged || 0,
            offer: item.offer || "",
        });
        setShowEditModal(true);
    };

    const cancelEdit = () => {
        setShowEditModal(false);
        setEditForm({});
        setSelectedActivation(null);
    };

    const saveEditedActivation = async () => {
        if (!editForm.activation_id) return alert('Missing activation id');
        try {
            const payload = {
                activation_id: editForm.activation_id,
                username: editForm.username,
                plan_id: selectedActivation?.plan_id || editForm.plan_id || null,
                company_id: selectedActivation?.company_id || editForm.company_id || null,
                phone_no: editForm.phone_no || editForm.simNumber || '',
                amount_charged: editForm.amount_charged || 0,
                amount: editForm.amount || editForm.amount_charged || 0,
                emi: editForm.emi || '',
                eid: editForm.eid || '',
                iccid: editForm.iccid || '',
                email: editForm.email || '',
                postal_code: editForm.postal_code || 0,
                pin_code: editForm.pin_code || 0,
            };

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/update-activation/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.status === 'success') {
                alert('Activation updated');
                setShowEditModal(false);
                setEditForm({});
                setSelectedActivation(null);
                loadData();
            } else {
                alert(data.message || 'Error updating activation');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating activation');
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg py-4 overflow-hidden">
            <div className="bg-white z-20">
                <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center px-4 mb-4 gap-4">
                    <div className="flex gap-x-3 items-center">
                        <div className="bg-blue-100 p-2 w-fit rounded-xl shadow-inner">
                            <CircleDollarSign className="text-blue-700" size={38} />
                        </div>
                        <div>
                            <h1 className="text-gray-900 font-extrabold lg:text-xl md:text-lg text-base tracking-wide">Admin Sim Activations</h1>
                            <p className="text-gray-400/80 font-medium italic lg:text-base md:text-sm text-xs">Approve SIM activation requests</p>
                        </div>
                    </div>
                </div>

                <hr className="py-2" />

                <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 px-4 pb-5">
                    <div className="border rounded-lg text-sm w-fit">
                        <button onClick={() => setPreFilter('all')} className={`rounded-l-lg px-4 py-2 border-r ${preFilter === 'all' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>All</button>
                        <button onClick={() => setPreFilter('approved')} className={`px-4 py-2 border-r ${preFilter === 'approved' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>Approved</button>
                        <button onClick={() => setPreFilter('pending')} className={`px-4 py-2 border-r ${preFilter === 'pending' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>Pending</button>
                        <button onClick={() => setPreFilter('cancelled')} className={`rounded-r-lg px-4 py-2 ${preFilter === 'cancelled' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>Cancelled</button>
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
                                        {filterOptions.map((filter) => (
                                            <div key={filter.key} className={`cursor-pointer px-3 py-1 rounded ${selectedFilter === filter.key ? "bg-blue-500 text-white" : "text-gray-700"}`} onClick={() => { setSelectedFilter(filter.key); setIsFilterOpen(false); }}>
                                                {filter.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input type="text" placeholder="Search activations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:h-[59vh] h-[54vh] w-full">
                <div className="flex-1 overflow-y-auto w-full md:px-0 px-4">
                    <table className="w-full text-sm text-gray-700 lg:inline-table hidden overflow-x-auto">
                        <thead className="bg-blue-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                            <tr>
                                <th className="px-10 py-3 text-left sticky left-0 bg-blue-50">No</th>
                                <th className="px-10 py-3 text-left">Username</th>
                                <th className="px-10 py-3 text-left">Email</th>
                                <th className="px-10 py-3 text-left">Plan</th>
                                <th className="px-10 py-3 text-left">Phone No</th>
                                <th className="px-10 py-3 text-left">EMI</th>
                                <th className="px-10 py-3 text-left">EID</th>
                                <th className="px-10 py-3 text-left">ICCID</th>
                                <th className="px-10 py-3 text-left whitespace-nowrap">Postal Code</th>
                                <th className="px-10 py-3 text-left whitespace-nowrap">Pin code</th>
                                <th className="px-10 py-3 text-left">Timestamp</th>
                                <th className="px-10 py-3 text-left">Amount</th>
                                <th className="px-10 py-3 text-left whitespace-nowrap">Paid Amount</th>
                                <th className="px-10 py-3 text-left">Status</th>
                                <th className="px-10 py-3 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, idx) => {
                                    const absoluteIndex = (currentPage - 1) * itemsPerPage + idx;
                                    return (
                                        <tr key={item.activation_id} className="border-t hover:bg-gray-50">
                                            <td className="px-10 py-3 font-semibold sticky left-0 bg-white">{absoluteIndex < 9 ? `0${absoluteIndex + 1}` : absoluteIndex + 1}</td>
                                            <td className="px-10 py-3 font-semibold">{item.username}</td>
                                            <td className="px-10 py-3">{item.email}</td>
                                            <td className="px-10 py-3 whitespace-nowrap">{item.plan_name}</td>
                                            <td className="px-10 py-3">{item.phone_no}</td>
                                            <td className="px-10 py-3">{item.emi}</td>
                                            <td className="px-10 py-3">{item.eid}</td>
                                            <td className="px-10 py-3">{item.iccid}</td>
                                            <td className="px-10 py-3">{item.postal_code}</td>
                                            <td className="px-10 py-3">{item.pin_code}</td>
                                            <td className="px-10 py-3 whitespace-nowrap ">{new Date(item.timestamp).toLocaleString()}</td>
                                            <td className="px-10 py-3 text-red-600 font-semibold">$ {item.amount}</td>
                                            <td className="px-10 py-3 text-green-600 font-semibold">$ {item.amount_charged}</td>
                                            <td className="px-10 py-3">
                                                {item.pending === 'Pending' ? (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">Pending</span>
                                                ) : item.pending === 'Approved' ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs">Approved</span>
                                                ) : item.pending === 'Canceled' || item.pending === 'Cancelled' ? (
                                                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs">Cancelled</span>
                                                ) : null}
                                            </td>
                                            <td className="px-10 py-3 flex items-center gap-2">
                                                {item.pending === 'Pending' && (
                                                    <>
                                                        <button onClick={() => { setSelectedActivation(item); setShowApproveModal(true); }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700">Approve</button>
                                                        <button onClick={() => startEdit(item)} className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-600">Edit</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="15" className="px-10 py-6 text-center text-gray-500">No results found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* mobile list - use currentItems for consistent paging */}
                    {currentItems.map((item, idx) => {
                        const absoluteIndex = (currentPage - 1) * itemsPerPage + idx;
                        return (
                            <div key={item.activation_id} className="md:hidden border rounded-xl shadow-sm p-4 mb-4 bg-white hover:shadow-md transition flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                                    <div className="text-gray-700 font-bold text-lg">#{absoluteIndex + 1}</div>
                                    <div className="text-gray-500 text-sm">{item.username}</div>
                                </div>

                                <div className="text-green-600 font-semibold text-lg">$ {item.amount_charged}</div>

                                <div>{item.pending === 'Pending' ? (<span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>) : item.pending === 'Approved' ? (<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>) : (<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Cancelled</span>)}</div>

                                <div>{item.pending === 'Pending' && (<button onClick={() => { setSelectedActivation(item); setShowApproveModal(true); }} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">Approve</button>)}</div>

                                <div>{item.pending === 'Pending' && (<button onClick={() => startEdit(item)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm">Edit</button>)}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center mt-2 sticky bottom-0 bg-white md:px-8 px-4 pt-3 z-20 border-t">
                    <div className="text-gray-600 text-sm">Total Records: {filteredData.length}</div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"><ChevronLeft size={18} className="text-gray-600" /></button>
                            <div className="flex items-center gap-1">{Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                <button key={num} onClick={() => setCurrentPage(num)} className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm transition shadow-sm ${currentPage === num ? "bg-indigo-100 text-indigo-600 border-indigo-300" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}>{num}</button>
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

            {showApproveModal && selectedActivation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-lg p-6 relative">
                        <button onClick={() => setShowApproveModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"><X size={22} /></button>

                        <h2 className="text-xl font-semibold mb-4">Approve SIM Activation</h2>

                        <div className="space-y-3 text-sm">
                            <p><b>Username:</b> {selectedActivation.username}</p>
                            <p><b>Activation ID:</b> {selectedActivation.activation_id}</p>
                            <p><b>Plan ID:</b> {selectedActivation.plan_id}</p>
                            <p><b>Phone No:</b> {selectedActivation.phone_no}</p>
                            <p><b>Amount:</b> $ {selectedActivation.amount_charged}</p>
                            <p><b>Offer:</b> {selectedActivation.offer}</p>
                        </div>

                        <button onClick={approveActivation} className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Approve Activation</button>
                    </div>
                </div>
            )}

            {showEditModal && selectedActivation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-[95%] max-w-2xl rounded-2xl shadow-lg p-6 relative">
                        <button onClick={cancelEdit} className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"><X size={22} /></button>

                        <h2 className="text-xl font-semibold mb-4">Edit SIM Activation</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

                            <div>
                                <label className="text-xs text-gray-500">Username</label>
                                <input value={editForm.username || ''} disabled className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Email</label>
                                <input value={editForm.email || ''} disabled className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Phone No</label>
                                <input value={editForm.phone_no || ''} onChange={(e) => setEditForm({ ...editForm, phone_no: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">SIM Number</label>
                                <input value={editForm.simNumber || ''} onChange={(e) => setEditForm({ ...editForm, simNumber: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">EID</label>
                                <input value={editForm.eid || ''} onChange={(e) => setEditForm({ ...editForm, eid: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">ICCID</label>
                                <input value={editForm.iccid || ''} onChange={(e) => setEditForm({ ...editForm, iccid: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Postal Code</label>
                                <input type="number" value={editForm.postal_code || 0} onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Pin Code</label>
                                <input value={editForm.pin_code || 0} onChange={(e) => setEditForm({ ...editForm, pin_code: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">EMI</label>
                                <input value={editForm.emi || ''} onChange={(e) => setEditForm({ ...editForm, emi: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Amount Charged</label>
                                <input value={editForm.amount_charged || 0} disabled className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500">Offer</label>
                                <input value={editForm.offer || ''} onChange={(e) => setEditForm({ ...editForm, offer: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={saveEditedActivation} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">Save Changes</button>
                            <button onClick={cancelEdit} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSimActivation;
