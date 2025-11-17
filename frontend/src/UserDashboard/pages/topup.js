import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { getCarriersFromBackend } from "../../utilities/getCarriers";
function TopUp() {
    const [searchTerm, setSearchTerm] = useState("");
    const [topUpHistory, setTopUpHistory] = useState([]);
    const [isAddingTopUp, setIsAddingTopUp] = useState(false);
    const [carriers, setCarriers] = useState([]);
    const [selectedCarrier, setSelectedCarrier] = useState(null);
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [rephoneNumber, setRephoneNumber] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [availableBalance, setAvailableBalance] = useState(150);

    useEffect(() => {
        const carrierID = JSON.parse(localStorage.getItem("selectedCarrierID"));
        if (carrierID) {
            setIsAddingTopUp(true);
            setSelectedCarrier(carrierID);
        }
    }, [isAddingTopUp]);

    useEffect(() => {
        const fetchCarriers = async () => {
            const response = await getCarriersFromBackend();
            setCarriers(response);
        };
        fetchCarriers();
    }, []);


    const loadData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-topup/`);
            const data = await res.json();

            if (data.status === "success") {
                setTopUpHistory(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredData = topUpHistory.filter((item) =>
        item?.recharge_id?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );

    const handleSelect = (carrier) => {
        setSelectedCarrier(carrier.company_id);
        setError("");
    };

    const handleAmountChange = (e) => {
        const value = Number(e.target.value);
        if (value % 5 === 0 && value >= 5 && value <= 200) {
            setAmount(value);
            setError("");
        } else {
            setAmount(e.target.value);
            setError("Amount must be between $5–$200 in multiples of 5.");
        }
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric
        if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
        if (value.startsWith("0")) setError("Phone number cannot start with 0.");
        else setError("");
        setPhoneNumber(value);
    };

    const handlerePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric
        if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
        if (value.startsWith("0")) setError("Phone number cannot start with 0.");
        if (value !== phoneNumber) setError("Phone numbers do not match.");
        else setError("");
        setRephoneNumber(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ---------------- VALIDATION ----------------
        if (!selectedCarrier)
            return setError("Please select a carrier.");

        if (!amount || amount % 5 !== 0 || amount < 5 || amount > 200)
            return setError("Enter a valid amount (5–200 in multiples of 5).");

        if (!phoneNumber || phoneNumber.length !== 10 || phoneNumber.startsWith("0"))
            return setError("Enter a valid 10-digit phone number (cannot start with 0).");

        if (amount > availableBalance)
            return setError("Insufficient balance for this top-up.");

        if (phoneNumber !== rephoneNumber)
            return setError("Phone numbers do not match.");

        // Start process
        setIsProcessing(true);
        setError("");

        try {
            const payload = {
                company_id: selectedCarrier,
                amount: amount,
                phone_no: phoneNumber,
                username: JSON.parse(localStorage.getItem("userData")).username,
                request_topup: true,
            };

            const res = await fetch(
                `${process.env.REACT_APP_API_URL_PRODUCTION}/api/add-topup/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            // ---------------- RESPONSE HANDLING ----------------

            // Parse JSON safely
            let data = {};
            try {
                data = await res.json();
            } catch {
                data = {};
            }

            if (!res.ok) {
                // API returned an error status
                return setError(
                    data.error ||
                    data.message ||
                    "Top-up failed. Please try again."
                );
            }

            // SUCCESS
            alert(`Top-up successful! ${amount} PKR added to ${phoneNumber}.`);

            // Cleanup
            localStorage.removeItem("selectedCarrierID");
            setAmount("");
            setPhoneNumber("");
            setRephoneNumber("");
            setSelectedCarrier(null);

        } catch (err) {
            console.error("Top-up error:", err);
            setError("Something went wrong during the top-up. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };




    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Top UP History
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
                        onClick={() => setIsAddingTopUp(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg 
                                   hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> Add Balance
                    </button>
                </div>
            </div>

            {/* Table */}

            {isAddingTopUp ? (
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">
                        Top Up Your Balance
                    </h2>

                    {/* Carrier Selection */}
                    <label className="text-lg font-medium mb-2 block">Choose Your Carrier</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 mb-8">
                        {carriers.map((carrier, index) => {
                            const isSelected = selectedCarrier === carrier.company_id;
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(carrier)}
                                    className={`border p-4 rounded-lg shadow transition cursor-pointer 
              ${isSelected
                                            ? "border-blue-500 ring-2 ring-blue-300 bg-blue-50"
                                            : "hover:shadow-lg"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="carrier"
                                        checked={isSelected}
                                        onChange={() => handleSelect(carrier)}
                                        className="hidden"
                                    />
                                    <img
                                        src={carrier.logo_url}
                                        alt={carrier.name}
                                        className="w-full h-20 object-contain mb-4"
                                    />
                                    <h3
                                        className={`text-lg font-medium text-center ${isSelected ? "text-blue-600 font-semibold" : ""
                                            }`}
                                    >
                                        {carrier.name}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>

                    {/* Top-Up Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="border p-6 rounded-lg shadow-md bg-white space-y-5"
                    >
                        {/* Available Balance */}
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-700 font-medium">
                            Available Balance: ${availableBalance}
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="block font-medium mb-2 text-gray-700">Select Amount ($)</label>
                            <input
                                type="number"
                                min="5"
                                max="200"
                                step="5"
                                value={amount}
                                onChange={handleAmountChange}
                                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter amount (5 - 200)"
                            />
                            <p className="text-gray-500 text-sm mt-1">
                                Only multiples of 5 are allowed (5, 10, 15, ..., 200)
                            </p>
                        </div>

                        {/* Phone Number Input */}
                        <div>
                            <label className="block font-medium mb-2 text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter 10-digit number"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2 text-gray-700">Re-enter Phone Number</label>
                            <input
                                type="tel"
                                value={rephoneNumber}
                                onChange={handlerePhoneChange}
                                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter 10-digit number"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className={`w-full py-2 rounded-lg font-semibold text-white transition 
            ${isProcessing
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {isProcessing ? "Processing..." : "Confirm Top-Up"}
                        </button>
                    </form>
                </div>
            ) : (
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
                </div>
            )}


        </div>
    );
}

export default TopUp;

