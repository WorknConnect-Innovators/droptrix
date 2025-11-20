import React, { useEffect, useState } from "react";
import { Search, CheckCircle, X, ListFilterIcon, ChevronLeft, ChevronRight, CircleDollarSign } from "lucide-react";

function AdminTopups() {
    const [searchTerm, setSearchTerm] = useState("");
    const [topupHistory, setTopupHistory] = useState([]);
    const [selectedTopup, setSelectedTopup] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);

    const [selctedFilter, setSelectedFilter] = useState("company_id");
    const filterOptions = [
        { label: "Carrier", key: "company_id" },
        { label: "Amount", key: "amount" },
        { label: "Phone No", key: "phone_no" },
    ];
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [preFilter, setPreFilter] = useState('all');

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    // Load Topup Data
    const loadData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-topup/`);
            const data = await res.json();

            if (data.status === "success") {
                setTopupHistory(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredData = React.useMemo(() => {
        return topupHistory
            .filter((item) => {
                if (preFilter === "approved" && item.status !== 'Approved') return false;
                if (preFilter === "pending" && item.status === 'Approved') return false;
                return true;
            })
            .filter((item) => {
                const key = selctedFilter;
                const value = item[key];
                if (!value && value !== 0) return false;
                return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [topupHistory, selctedFilter, searchTerm, preFilter]);

    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem));
        setTotalPages(Math.max(1, Math.ceil(filteredData.length / itemsPerPage)));
    }, [filteredData, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selctedFilter, preFilter]);

    const approveTopup = async () => {
        if (!selectedTopup) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/make-topup-complete/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topup_id: selectedTopup.id }),
            });

            const data = await res.json();

            if (data.status === "success") {
                alert("Topup Approved Successfully!");
                setShowApproveModal(false);
                setSelectedTopup(null);
                loadData();
            }
        } catch (error) {
            console.error(error);
            alert("Error approving topup");
        }
    };

    const cancelTopup = async () => {
        if (!selectedTopup) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/cancel-topup-data/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topup_id: selectedTopup.id, topup_amount: selectedTopup.amount }),
            });

            const data = await res.json();
            if (data.status === "success") {
                alert("Topup Canceled");
                setShowApproveModal(false);
                setSelectedTopup(null);
                loadData();
            }
        } catch (error) {
            console.error(error);
            alert("Error canceling topup");
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
                            <h1 className="text-gray-900 font-extrabold lg:text-xl md:text-lg text-base tracking-wide">Admin Topups</h1>
                            <p className="text-gray-400/80 font-medium italic lg:text-base md:text-sm text-xs">Approve or cancel user topup requests</p>
                        </div>
                    </div>
                </div>

                <hr className="py-2" />

                <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 px-4 pb-5">
                    <div className="border rounded-lg text-sm w-fit">
                        <button onClick={() => setPreFilter('all')} className={`rounded-l-lg px-4 py-2 border-r ${preFilter === 'all' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>All</button>
                        <button onClick={() => setPreFilter('approved')} className={`px-4 py-2 border-r ${preFilter === 'approved' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>Approved</button>
                        <button onClick={() => setPreFilter('pending')} className={`rounded-r-lg px-4 py-2 ${preFilter === 'pending' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>Pending</button>
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
                                            <div key={filter.key} className={`cursor-pointer px-3 py-1 rounded ${selctedFilter === filter.key ? "bg-blue-500 text-white" : "text-gray-700"}`} onClick={() => { setSelectedFilter(filter.key); setIsFilterOpen(false); }}>
                                                {filter.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input type="text" placeholder="Search topups..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
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
                                <th className="px-10 py-3 text-left">Carrier</th>
                                <th className="px-10 py-3 text-left">Phone No</th>
                                <th className="px-10 py-3 text-left">Amount</th>
                                <th className="px-10 py-3 text-left">Status</th>
                                <th className="px-10 py-3 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length > 0 ? (
                                currentItems.slice().reverse().map((item, index) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-50">
                                        <td className="px-10 py-3 font-semibold">{index <= 8 ? `0${index + 1}` : index + 1}</td>
                                        <td className="px-10 py-3 font-semibold">{item.username}</td>
                                        <td className="px-10 py-3">{item.company_id}</td>
                                        <td className="px-10 py-3">{item.phone_no}</td>
                                        <td className="px-10 py-3 text-green-600 font-semibold">$ {item.amount}</td>
                                        <td className="px-10 py-3">{item.status === 'Approved' ? (<span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs">Approved</span>) : (<span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">Pending</span>)}</td>
                                        <td className="px-10 py-3">
                                            {item.status !== 'Approved' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setSelectedTopup(item); setShowApproveModal(true); }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700"><CheckCircle size={14} /> Approve</button>
                                                    <button onClick={() => { setSelectedTopup(item); setShowApproveModal(true); }} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700">Cancel</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-10 py-6 text-center text-gray-500">No results found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {filteredData.slice().reverse().map((item, index) => (
                        <div key={item.id} className="md:hidden border rounded-xl shadow-sm p-4 mb-4 bg-white hover:shadow-md transition flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                                <div className="text-gray-700 font-bold text-lg">#{index + 1}</div>
                                <div className="text-gray-500 text-sm">{item.username}</div>
                            </div>

                            <div className="text-green-600 font-semibold text-lg">$ {item.amount}</div>

                            <div>
                                {item.status === 'Approved' ? (<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>) : (<span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>)}
                            </div>

                            <div>
                                {item.status !== 'Approved' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => { setSelectedTopup(item); setShowApproveModal(true); }} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">Approve</button>
                                        <button onClick={() => { setSelectedTopup(item); setShowApproveModal(true); }} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm">Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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

            {showApproveModal && selectedTopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-lg p-6 relative">
                        <button onClick={() => setShowApproveModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"><X size={22} /></button>

                        <h2 className="text-xl font-semibold mb-4">Manage Topup</h2>

                        <div className="space-y-3 text-sm">
                            <p><b>Username:</b> {selectedTopup.username}</p>
                            <p><b>Topup ID:</b> {selectedTopup.id}</p>
                            <p><b>Phone No:</b> {selectedTopup.phone_no}</p>
                            <p><b>Amount:</b> $ {selectedTopup.amount}</p>
                            <p><b>Current Status:</b> {selectedTopup.status}</p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            {selectedTopup.status !== 'Approved' && <button onClick={approveTopup} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Approve</button>}
                            <button onClick={cancelTopup} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminTopups;
