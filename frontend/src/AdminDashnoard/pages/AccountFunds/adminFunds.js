import React, { useEffect, useState } from "react";
import { Search, CheckCircle, X } from "lucide-react";

function AdminFunds() {
    const [searchTerm, setSearchTerm] = useState("");
    const [rechargeHistory, setRechargeHistory] = useState([]);
    const [selectedRecharge, setSelectedRecharge] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);

    // ======================================================
    // Load Recharge Data
    // ======================================================
    const loadData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-all-recharge-data/`);
            const data = await res.json();

            if (data.status === "success") {
                setRechargeHistory(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredData = rechargeHistory.filter((item) =>
        item.recharge_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ======================================================
    // Approve Recharge
    // ======================================================
    const approveRecharge = async () => {
        if (!selectedRecharge) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/admin/approve-recharge/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recharge_id: selectedRecharge.recharge_id,
                    username: selectedRecharge.username,
                }),
            });

            const data = await res.json();

            if (data.status === "success") {
                alert("Recharge Approved Successfully!");
                setShowApproveModal(false);
                setSelectedRecharge(null);
                loadData();
            }
        } catch (error) {
            console.error(error);
            alert("Error approving recharge");
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Admin Recharge Approvals
                </h1>

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

            {/* Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-blue-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">No</th>
                            <th className="px-6 py-3 text-left">Username</th>
                            <th className="px-6 py-3 text-left">Time</th>
                            <th className="px-6 py-3 text-left">Amount</th>
                            <th className="px-6 py-3 text-left">Screenshot</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.slice().reverse().map((item, index) => (
                                <tr key={item.recharge_id} className="border-t hover:bg-gray-50">
                                    <td className="px-6 py-3">{index + 1}</td>
                                    <td className="px-6 py-3 font-semibold">{item.username}</td>
                                    <td className="px-6 py-3">{new Date(item.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-green-600 font-semibold">$ {item.amount}</td>
                                    <td className="px-6 py-3">
                                        <a
                                            href={item.payment_screenshot}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            View
                                        </a>
                                    </td>

                                    <td className="px-6 py-3">
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

                                    <td className="px-6 py-3">
                                        {!item.approved && (
                                            <button
                                                onClick={() => {
                                                    setSelectedRecharge(item);
                                                    setShowApproveModal(true);
                                                }}
                                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700"
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-6 text-center text-gray-500">
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Approve Modal */}
            {showApproveModal && selectedRecharge && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-lg p-6 relative">

                        {/* Close */}
                        <button
                            onClick={() => setShowApproveModal(false)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-xl font-semibold mb-4">Approve Recharge</h2>

                        <div className="space-y-3 text-sm">
                            <p><b>Username:</b> {selectedRecharge.username}</p>
                            <p><b>Recharge ID:</b> {selectedRecharge.recharge_id}</p>
                            <p><b>Amount:</b> $ {selectedRecharge.amount}</p>

                            <p><b>Payment Screenshot:</b></p>
                            <img
                                src={selectedRecharge.payment_screenshot}
                                alt="screenshot"
                                className="w-32 h-32 rounded-lg border"
                            />
                        </div>

                        <button
                            onClick={approveRecharge}
                            className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                        >
                            Approve Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminFunds;
