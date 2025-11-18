import React, { useEffect, useState } from "react";
import { Search, Plus, X, ListFilterIcon, ChevronRight, ChevronLeft, CircleDollarSign } from "lucide-react";
import { message } from "antd";


function AddFunds() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(1);
    const [viewingScreenshot, setViewingScreenshot] = useState(false);
    const [viewScreenshotUrl, setViewScreenshotUrl] = useState("");
    const [totalBalance, setTotalBalance] = useState(0);
    const [selctedFilter, setSelectedFilter] = useState("timestamp");
    const filterOptions = [
        { label: "Time", key: "timestamp" },
        { label: "Amount", key: "amount" },
    ];
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [preFilter, setPreFilter] = useState('all');

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const [rechargeHistory, setRechargeHistory] = useState([]);
    const user = localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")) : null;

    const [newRecharge, setNewRecharge] = useState({
        amount: "",
        username: user ? user.username : "",
        payment_screenshot: "",
    });

    const loadBalance = async () => {
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-account-balance/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user?.username }),
                }
            );
            const data = await res.json();

            if (data.status === "success") {
                setTotalBalance(data.data_received.account_balance_amount);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-recharge-data/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user?.username }),
            });
            const data = await res.json();

            if (data.status === "success") {
                setRechargeHistory(data.data_received);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadData();
        loadBalance();
    }, []);

    const filteredData = React.useMemo(() => {
        return rechargeHistory
            .filter((item) => {
                // 🔹 Step 1: Apply preFilter (status-based filtering)
                if (preFilter === "approved" && !item.approved) return false;
                if (preFilter === "pending" && item.approved) return false;

                return true;
            })
            .filter((item) => {
                // 🔹 Step 2: Apply search + selected filter
                let value = item[selctedFilter];

                if (selctedFilter === "timestamp" && value) {
                    value = new Date(value).toLocaleString();
                }

                if (!value) return false;

                return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [rechargeHistory, selctedFilter, searchTerm, preFilter]);


    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem));
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    }, [filteredData, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selctedFilter]);

    const handleCloudinaryUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "droptrixAccountsPayments");

        setUploading(true);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/dyodgkvkr/image/upload`,
                { method: "POST", body: formData }
            );

            const data = await res.json();
            setUploading(false);
            return data.secure_url || null;
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            setUploading(false);
            return null;
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadedUrl = await handleCloudinaryUpload(file);

        if (uploadedUrl) {
            setNewRecharge((prev) => ({
                ...prev,
                payment_screenshot: uploadedUrl,
            }));
        }
    };

    const submitRecharge = async () => {
        if (!newRecharge.amount) {
            message.info("Please fill all fields!");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/user-recharge-account/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRecharge),
            });

            const data = await res.json();

            if (data.status === "success") {
                message.success("Recharge Submitted Successfully!");

                setShowForm(false);
                setNewRecharge({
                    amount: "",
                    payment_screenshot: "",
                });
                setStep(1);

                loadData();
            }
        } catch (error) {
            console.error(error);
            message.error("Error submitting recharge");
        }
    };


    const viewScreenshot = (url) => {
        setViewingScreenshot(true);
        setViewScreenshotUrl(url);
    }

    const cancelRecharge = () => {
        setShowForm(false);
        setStep(1);
        setNewRecharge({
            amount: "",
            username: user ? user.username : "",
            payment_screenshot: "",
        });
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
                            <h1 className="text-gray-900 font-extrabold lg:text-xl md:text-lg text-base tracking-wide">
                                Account Balance History
                            </h1>

                            <p className="text-gray-400/80 font-medium italic lg:text-base md:text-sm text-xs">
                                View and manage your account balance recharges
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-fit lg:self-auto self-end flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg 
                                   hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> Add Balance
                    </button>
                </div>

                <hr className="py-2" />

                {/* Header */}
                <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 px-4 pb-5">
                    <div className="border rounded-lg text-sm w-fit">
                        <button onClick={() => setPreFilter('all')} className={`rounded-l-lg px-4 py-2 border-r ${preFilter === 'all' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`} >All</button>
                        <button onClick={() => setPreFilter('approved')} className={`px-4 py-2 border-r ${preFilter === 'approved' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`} >Approved</button>
                        <button onClick={() => setPreFilter('pending')} className={`rounded-r-lg px-4 py-2 ${preFilter === 'pending' ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`} >Pending</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative" >
                            <div
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer  text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                                <ListFilterIcon />
                                <label className="cursor-pointer">Filters</label>
                            </div>
                            <div className="absolute z-50">
                                {isFilterOpen && (
                                    <div className="bg-white border border-gray-300 rounded shadow-md p-2">
                                        {filterOptions.map((filter) => (
                                            <div
                                                key={filter.key}
                                                className={`cursor-pointer px-3 py-1 rounded ${selctedFilter === filter.key ? "bg-blue-500 text-white" : "text-gray-700"
                                                    }`}
                                                onClick={() => {
                                                    setSelectedFilter(filter.key);
                                                    setIsFilterOpen(false);
                                                }}
                                            >
                                                {filter.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search Recharge..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Table Section */}
            <div className="flex flex-col md:h-[59vh] h-[54vh] w-full">

                {/* Scrollable table body */}
                <div className="flex-1 overflow-y-auto w-full md:px-0 px-4">

                    <table className="w-full  text-sm text-gray-700 lg:inline-table hidden">
                        <thead className="bg-blue-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                            <tr>
                                <th className="px-10 py-3 text-left">No</th>
                                <th className="px-10 py-3 text-left">Time</th>
                                <th className="px-10 py-3 text-left">Amount</th>
                                <th className="px-10 py-3 text-left">Screenshot</th>
                                <th className="px-10 py-3 text-left">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length > 0 ? (
                                currentItems.slice().reverse().map((item, index) => (
                                    <tr key={item.recharge_id} className="border-t hover:bg-gray-50">
                                        <td className="px-10 py-3 font-semibold">{index <= 8 ? `0${index + 1}` : index + 1}</td>
                                        <td className="px-10 py-3">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-10 py-3 text-green-600 font-semibold">
                                            $ {item.amount}
                                        </td>
                                        <td
                                            className="px-10 py-3 text-blue-600 underline cursor-pointer"
                                            onClick={() => viewScreenshot(item.payment_screenshot)}
                                        >
                                            View
                                        </td>
                                        <td className="px-10 py-3">
                                            {item.approved ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-10 py-6 text-center text-gray-500"
                                    >
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {filteredData.slice().reverse().map((item, index) => (
                        <div
                            key={item.recharge_id}
                            className="md:hidden border rounded-xl shadow-sm p-4 mb-4 bg-white hover:shadow-md transition flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                        >
                            {/* Left Section: Number & Time */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                                <div className="text-gray-700 font-bold text-lg">#{index + 1}</div>
                                <div className="text-gray-500 text-sm">{new Date(item.timestamp).toLocaleString()}</div>
                            </div>

                            {/* Middle Section: Amount */}
                            <div className="text-green-600 font-semibold text-lg">
                                $ {item.amount}
                            </div>

                            {/* Screenshot */}
                            <div>
                                <button
                                    onClick={() => viewScreenshot(item.payment_screenshot)}
                                    className="text-blue-600 underline text-sm hover:text-blue-800"
                                >
                                    View Screenshot
                                </button>
                            </div>

                            {/* Status */}
                            <div>
                                {item.approved ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Approved
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sticky footer / pagination */}
                <div className="flex justify-between items-center mt-2 sticky bottom-0 bg-white md:px-8 px-4 pt-3 z-20 border-t">

                    {/* Left side text */}
                    <div className="text-gray-600 text-sm">
                        Available Balance: {totalBalance} USD
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">

                            {/* Left Arrow */}
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 
                   disabled:opacity-40 hover:bg-gray-100 transition"
                            >
                                <ChevronLeft size={18} className="text-gray-600" />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md border 
                            text-sm transition shadow-sm
                            ${currentPage === num
                                                ? "bg-indigo-100 text-indigo-600 border-indigo-300"
                                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            {/* Right Arrow */}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 
                   disabled:opacity-40 hover:bg-gray-100 transition"
                            >
                                <ChevronRight size={18} className="text-gray-600" />
                            </button>
                        </div>
                    )}

                    {/* 🔥 Fixed dropdown for rows per page */}
                    <select
                        className="border rounded-lg md:px-4 px-2 py-2 text-gray-600 text-sm md:block hidden"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value="10">10 / page</option>
                        <option value="25">25 / page</option>
                        <option value="50">50 / page</option>
                        <option value="100">100 / page</option>
                    </select>

                </div>
            </div>

            {/* Add Recharge Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center md:items-center items-end md:mb-0 pb-10 z-50">
                    <div className="bg-white w-[90%] max-w-lg rounded-2xl shadow-lg relative">

                        {/* Modal Header */}
                        <div className="flex justify-between bg-white sticky top-0 p-4 rounded-t-2xl">
                            <h2 className="text-xl font-semibold">
                                {step === 1 ? "Enter Amount" : step === 2 ? "Payment Details" : "Upload Screenshot"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-800">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 pt-2">

                            {/* ---------------- STEP 1 ---------------- */}
                            {step === 1 && (
                                <div>
                                    <input
                                        type="number"
                                        className="w-full mt-1 border rounded-lg px-3 py-2"
                                        value={newRecharge.amount}
                                        onChange={(e) =>
                                            setNewRecharge({ ...newRecharge, amount: e.target.value })
                                        }
                                        placeholder="Enter amount"
                                    />

                                    <div className="flex justify-between mt-6">
                                        <button
                                            onClick={cancelRecharge}
                                            className="px-4 py-2 text-gray-700"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            disabled={!newRecharge.amount}
                                            onClick={() => setStep(2)}
                                            className={`px-4 py-2 text-gray-700 rounded-lg 
                                ${newRecharge.amount ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ---------------- STEP 2 ---------------- */}
                            {step === 2 && (
                                <div>

                                    {/* Bank Details */}
                                    <h3 className="text-lg font-semibold mb-2">Send Payment To:</h3>

                                    <div className="p-3 border rounded-lg bg-gray-50 text-sm">
                                        <p><b>Bank:</b> Meezan Bank</p>
                                        <p><b>Account Title:</b> DropTrix Pvt Ltd</p>
                                        <p><b>Account No:</b> 0123456789123</p>
                                        <p><b>IBAN:</b> PK12MEZN0000123456789101</p>
                                    </div>

                                    {/* Amount Calculation */}
                                    <div className="mt-5 p-3 border rounded-lg bg-gray-50 text-sm">
                                        <p className="flex justify-between">
                                            <span>Amount:</span>
                                            <span>$ {newRecharge.amount}</span>
                                        </p>
                                        <p className="flex justify-between mt-1">
                                            <span>Tax (5%):</span>
                                            <span>$ {(newRecharge.amount * 0.05).toFixed(0)}</span>
                                        </p>
                                        <hr className="my-2" />
                                        <p className="flex justify-between font-semibold">
                                            <span>Total Payable:</span>
                                            <span>
                                                $ {(newRecharge.amount * 1.05).toFixed(0)}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex justify-between mt-6">
                                        <div className="flex gap-x-2">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-4 py-2 text-gray-700"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={cancelRecharge}
                                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setStep(3)}
                                            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ---------------- STEP 3 ---------------- */}
                            {step === 3 && (
                                <div>

                                    {uploading ? (
                                        <p className="text-blue-500 mt-2">Uploading...</p>
                                    ) : newRecharge.payment_screenshot ? (
                                        <img
                                            src={newRecharge.payment_screenshot}
                                            alt="preview"
                                            className="h-20 w-20 object-cover rounded-lg mt-2"
                                        />
                                    ) : null}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="mt-2 text-sm"
                                    />

                                    <div className="flex justify-between mt-6">
                                        <div className="flex gap-x-2 ">
                                            <button
                                                onClick={() => setStep(2)}
                                                className="px-4 py-2 text-gray-700"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={cancelRecharge}
                                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <button
                                            onClick={submitRecharge}
                                            disabled={!newRecharge.payment_screenshot || uploading}
                                            className={`bg-blue-600 px-5 py-2 text-white rounded-lg hover:bg-blue-700 ${!newRecharge.payment_screenshot || uploading ? "opacity-50 cursor-not-allowed" : ""} `}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
            {viewingScreenshot && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white w-fit max-w-lg rounded-2xl shadow-lg relative p-2">

                        {/* ❌ Close Button (circle, half outside, half inside) */}
                        <button
                            onClick={() => setViewingScreenshot(false)}
                            className="absolute -top-3 -right-3 bg-white text-gray-700 shadow-lg 
                           rounded-full p-2 hover:bg-gray-100 transition"
                        >
                            <X size={18} />
                        </button>

                        <img
                            src={viewScreenshotUrl}
                            alt="screenshot"
                            className="max-h-[80vh] rounded-lg"
                        />
                    </div>
                </div>
            )}


        </div>
    );
}

export default AddFunds;
