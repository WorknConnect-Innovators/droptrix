import React, { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";

function AddFunds() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(1);

    const [rechargeHistory, setRechargeHistory] = useState([]);
    const user = localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")) : null;

    const [newRecharge, setNewRecharge] = useState({
        amount: "",
        username: user ? user.username : "",
        payment_screenshot: "",
    });

    // ======================================================
    // 1️⃣ Load Recharge History using FETCH
    // ======================================================
    const loadData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-recharge-data/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user?.username }),
            });
            const data = await res.json();

            console.log("User Data", data)

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

    // ======================================================
    // 2️⃣ Upload Image to Cloudinary
    // ======================================================
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

    // ======================================================
    // 3️⃣ Handle File Change (Upload Screenshot)
    // ======================================================
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

    // ======================================================
    // 4️⃣ Submit Recharge using FETCH POST
    // ======================================================
    const submitRecharge = async () => {
        if (!newRecharge.amount) {
            alert("Please fill all fields!");
            return;
        }

        console.log("Submitting Recharge:", newRecharge);

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/user-recharge-account/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRecharge),
            });

            const data = await res.json();

            if (data.status === "success") {
                alert("Recharge Submitted! ID: " + data.data_received);

                setShowForm(false);
                setNewRecharge({
                    amount: "",
                    username: "",
                    payment_screenshot: "",
                });

                loadData();
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting recharge");
        }
    };

    // ======================================================
    // 5️⃣ Filter Search
    // ======================================================
    const filteredData = rechargeHistory.filter((item) =>
        item.recharge_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Recharge History
                </h1>

                <div className="flex items-center gap-3">
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

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg 
                                   hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> Add Balance
                    </button>
                </div>
            </div>

            {/* Recharge Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-blue-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">No</th>
                            <th className="px-6 py-3 text-left">Time</th>
                            <th className="px-6 py-3 text-left">Amount</th>
                            <th className="px-6 py-3 text-left">Screenshot</th>
                            <th className="px-6 py-3 text-left">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr
                                    key={item.recharge_id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="px-6 py-3 font-semibold">{index < 10 ? `0${index + 1}` : index + 1}</td>
                                    <td className="px-6 py-3">{new Date(item.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-green-600 font-semibold">
                                        $ {item.amount}
                                    </td>
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

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-6 text-center text-gray-500">
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="py-4 px-6 text-gray-600 text-sm border-t text-end ">
                    Available Balance: {rechargeHistory.length}
                </div>
            </div>

            {/* Add Recharge Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
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
                        <div className="p-4">

                            {/* ---------------- STEP 1 ---------------- */}
                            {step === 1 && (
                                <div>
                                    <label className="text-sm font-medium">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full mt-1 border rounded-lg px-3 py-2"
                                        value={newRecharge.amount}
                                        onChange={(e) =>
                                            setNewRecharge({ ...newRecharge, amount: e.target.value })
                                        }
                                        placeholder="Enter amount"
                                    />

                                    <button
                                        disabled={!newRecharge.amount}
                                        onClick={() => setStep(2)}
                                        className={`mt-6 w-full py-2 rounded-lg 
                                ${newRecharge.amount ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
                                    >
                                        Next
                                    </button>
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
                                        <button
                                            onClick={() => setStep(1)}
                                            className="px-4 py-2 text-gray-700"
                                        >
                                            Back
                                        </button>

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

                                    <label className="text-sm font-medium">Upload Payment Screenshot</label>

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
                                        <button
                                            onClick={() => setStep(2)}
                                            className="px-4 py-2 text-gray-700"
                                        >
                                            Back
                                        </button>

                                        <button
                                            onClick={submitRecharge}
                                            className="bg-blue-600 px-5 py-2 text-white rounded-lg hover:bg-blue-700"
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

        </div>
    );
}

export default AddFunds;
