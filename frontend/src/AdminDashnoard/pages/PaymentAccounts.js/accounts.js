import { CreditCard, Plus, Search, ListFilterIcon, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react'
import React, { useState, useEffect } from 'react'

function PaymentAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("account_title");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);

    const filterOptions = [
        { label: "Account Title", key: "account_title" },
        { label: "Bank Name", key: "bank_name" },
        { label: "Account No", key: "account_no" },
        { label: "IBAN No", key: "iban_no" },
    ];

    const [formData, setFormData] = useState({
        account_title: "",
        account_no: "",
        iban_no: "",
        bank_name: "",
        account_priority: "1",
    });

    // Load Payment Accounts Data
    const loadData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-payment-accounts/`);
            const data = await res.json();

            if (data.status === "success") {
                setAccounts(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredData = React.useMemo(() => {
        return accounts.filter((item) => {
            const key = selectedFilter;
            const value = item[key];
            if (!value && value !== 0) return false;
            return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [accounts, selectedFilter, searchTerm]);

    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem));
        setTotalPages(Math.max(1, Math.ceil(filteredData.length / itemsPerPage)));
    }, [filteredData, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFilter]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddAccount = async () => {
        if (!formData.account_title || !formData.account_no || !formData.iban_no || !formData.bank_name) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/add-payment-account/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.status === "success") {
                alert("Account Added Successfully!");
                setFormData({
                    account_title: "",
                    account_no: "",
                    iban_no: "",
                    bank_name: "",
                    account_priority: "1",
                });
                setShowForm(false);
                loadData();
            }
        } catch (error) {
            console.error(error);
            alert("Error adding account");
        }
    };

    const handleUpdateAccount = async () => {
        if (!formData.account_title || !formData.account_no || !formData.iban_no || !formData.bank_name) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/update-payment-account/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, account_id: editingAccount.account_id }),
            });

            const data = await res.json();

            if (data.status === "success") {
                alert("Account Updated Successfully!");
                setFormData({
                    account_title: "",
                    account_no: "",
                    iban_no: "",
                    bank_name: "",
                    account_priority: "1",
                });
                setShowForm(false);
                setEditingAccount(null);
                loadData();
            }
        } catch (error) {
            console.error(error);
            alert("Error updating account");
        }
    };

    const handleEditClick = (account) => {
        setEditingAccount(account);
        setFormData({
            account_title: account.account_title,
            account_no: account.account_no,
            iban_no: account.iban_no,
            bank_name: account.bank_name,
            account_priority: account.account_priority,
        });
        setShowForm(true);
    };

    const handleDeleteClick = (account) => {
        setAccountToDelete(account);
        setShowDeleteModal(true);
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/delete-payment-account/`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account_id: accountToDelete.account_id }),
            });

            const data = await res.json();

            if (data.status === "success") {
                alert("Account Deleted Successfully!");
                setShowDeleteModal(false);
                setAccountToDelete(null);
                loadData();
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting account");
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingAccount(null);
        setFormData({
            account_title: "",
            account_no: "",
            iban_no: "",
            bank_name: "",
            account_priority: "1",
        });
    };

    return (
        <div className="bg-white shadow-lg rounded-lg py-4 overflow-hidden">
            <div className="bg-white z-20">
                <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center px-4 mb-4 gap-4">
                    <div className="flex gap-x-3 items-center">
                        <div className="bg-blue-100 p-2 w-fit rounded-xl shadow-inner">
                            <CreditCard className="text-blue-700" size={38} />
                        </div>

                        <div>
                            <h1 className="text-gray-900 font-extrabold lg:text-xl md:text-lg text-base tracking-wide">{editingAccount ? "Edit Account" : showForm ? "Add New Account" : "Payment Accounts"}</h1>
                            <p className="text-gray-400/80 font-medium italic lg:text-base md:text-sm text-xs">Add and review your payment accounts</p>
                        </div>
                    </div>

                    <button onClick={() => { setShowForm(!showForm) }} className='flex w-fit px-4 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition'>
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        <span className="font-medium text-sm ml-1">{showForm ? "Cancel" : "Add Account"}</span>
                    </button>
                </div>

                <hr className="py-2" />

                {showForm ? (
                    <div className="sm:px-8 px-4 sm:py-4 md:h-[67vh] h-[60vh] w-full overflow-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Title</label>
                                <input
                                    type="text"
                                    name="account_title"
                                    value={formData.account_title}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter account title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Account No</label>
                                <input
                                    type="text"
                                    name="account_no"
                                    value={formData.account_no}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter account number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">IBAN No</label>
                                <input
                                    type="text"
                                    name="iban_no"
                                    value={formData.iban_no}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter IBAN number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={formData.bank_name}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter bank name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Priority</label>
                                <select
                                    name="account_priority"
                                    value={formData.account_priority}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="1">1 (Highest)</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5 (Lowest)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 w-full justify-end">
                            <button
                                onClick={editingAccount ? handleUpdateAccount : handleAddAccount}
                                className="w-fit bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold transition"
                            >
                                {editingAccount ? "Update Account" : "Add Account"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 px-4 pb-5">
                            <div className="relative">
                                <div onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 border border-gray-300 rounded-lg px-12 py-2 cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                                    <ListFilterIcon size={18} />
                                    <label className="cursor-pointer text-sm">Filters</label>
                                </div>
                                <div className="absolute z-50">
                                    {isFilterOpen && (
                                        <div className="bg-white border border-gray-300 rounded shadow-md p-2 mt-2">
                                            {filterOptions.map((filter) => (
                                                <div key={filter.key} className={`cursor-pointer px-3 py-1 rounded text-sm ${selectedFilter === filter.key ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`} onClick={() => { setSelectedFilter(filter.key); setIsFilterOpen(false); }}>
                                                    {filter.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative w-full lg:w-auto">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input type="text" placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>
                        </div>

                        <div className="flex flex-col md:h-[59vh] h-[54vh] w-full">
                            <div className="flex-1 overflow-y-auto w-full md:px-0 px-4">
                                <table className="w-full text-sm text-gray-700 lg:inline-table hidden">
                                    <thead className="bg-blue-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left">No</th>
                                            <th className="px-6 py-3 text-left">Account Title</th>
                                            <th className="px-6 py-3 text-left">Account No</th>
                                            <th className="px-6 py-3 text-left">IBAN No</th>
                                            <th className="px-6 py-3 text-left">Bank Name</th>
                                            <th className="px-6 py-3 text-left">Priority</th>
                                            <th className="px-6 py-3 text-left">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredData.length > 0 ? (
                                            currentItems.slice().reverse().map((item, index) => (
                                                <tr key={index} className="border-t hover:bg-gray-50">
                                                    <td className="px-6 py-3 font-semibold">{index <= 8 ? `0${index + 1}` : index + 1}</td>
                                                    <td className="px-6 py-3 font-semibold">{item.account_title}</td>
                                                    <td className="px-6 py-3">{item.account_no}</td>
                                                    <td className="px-6 py-3">{item.iban_no}</td>
                                                    <td className="px-6 py-3">{item.bank_name}</td>
                                                    <td className="px-6 py-3">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">{item.account_priority}</span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditClick(item)}
                                                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition"
                                                            >
                                                                <Edit size={14} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(item)}
                                                                className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700 transition"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-6 text-center text-gray-500">No results found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {filteredData.slice().reverse().map((item, index) => (
                                    <div key={index} className="md:hidden border rounded-xl shadow-sm p-4 mb-4 bg-white hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="text-gray-700 font-bold text-lg">#{index + 1}</div>
                                                <div className="text-gray-600 font-semibold text-sm mt-1">{item.account_title}</div>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">Priority {item.account_priority}</span>
                                        </div>

                                        <div className="space-y-2 text-sm mb-4">
                                            <p className="text-gray-600"><span className="font-semibold">Account No:</span> {item.account_no}</p>
                                            <p className="text-gray-600"><span className="font-semibold">IBAN No:</span> {item.iban_no}</p>
                                            <p className="text-gray-600"><span className="font-semibold">Bank:</span> {item.bank_name}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                                            >
                                                <Edit size={16} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
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
                    </>
                )}
            </div>

            {showDeleteModal && accountToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-lg p-6 relative">
                        <button onClick={() => setShowDeleteModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"><X size={22} /></button>

                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Delete Account</h2>

                        <p className="text-gray-600 mb-4">Are you sure you want to delete this account? This action cannot be undone.</p>

                        <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg mb-6">
                            <p><b>Account Title:</b> {accountToDelete.account_title}</p>
                            <p><b>Account No:</b> {accountToDelete.account_no}</p>
                            <p><b>Bank:</b> {accountToDelete.bank_name}</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold transition">Delete</button>
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-semibold transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PaymentAccounts
