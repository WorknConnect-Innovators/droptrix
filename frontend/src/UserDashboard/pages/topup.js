import React, { useEffect, useState } from "react";
import { getCarriersFromBackend } from "../../utilities/getCarriers";

function TopUp() {
    const [carriers, setCarriers] = useState([]);
    const [selectedCarrier, setSelectedCarrier] = useState(null);
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [availableBalance, setAvailableBalance] = useState(150); // Example user balance (replace with API later)

    useEffect(() => {
        const fetchCarriers = async () => {
            const response = await getCarriersFromBackend();
            setCarriers(response);
        };
        fetchCarriers();
    }, []);

    const handleSelect = (carrier) => {
        setSelectedCarrier(carrier.name);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Validation checks
        if (!selectedCarrier) return setError("Please select a carrier.");
        if (!amount || amount % 5 !== 0 || amount < 5 || amount > 200)
            return setError("Enter a valid amount (5–200 in multiples of 5).");
        if (!phoneNumber || phoneNumber.length !== 10 || phoneNumber.startsWith("0"))
            return setError("Enter a valid 10-digit phone number (cannot start with 0).");
        if (amount > availableBalance)
            return setError("Insufficient balance for this top-up.");

        // ✅ Start process
        setIsProcessing(true);
        setError("");

        try {
            // Simulate API request
            await new Promise((resolve) => setTimeout(resolve, 1500));

            console.log("Top-Up Details:", {
                carrier: selectedCarrier,
                amount,
                phoneNumber,
            });

            alert(`Top-up successful! $${amount} added to ${phoneNumber} (${selectedCarrier})`);
            setAmount("");
            setPhoneNumber("");
            setSelectedCarrier(null);
        } catch (err) {
            setError("Something went wrong during top-up. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">
                Top Up Your Balance
            </h2>

            {/* Carrier Selection */}
            <label className="text-lg font-medium mb-2 block">Choose Your Carrier</label>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 mb-8">
                {carriers.map((carrier, index) => {
                    const isSelected = selectedCarrier === carrier.name;
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
    );
}

export default TopUp;
