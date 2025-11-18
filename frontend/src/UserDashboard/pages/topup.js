import { useEffect, useMemo, useState } from "react";
import {
    BanknoteArrowUp,
    ChevronLeft,
    ChevronRight,
    Delete,
    ListFilterIcon,
    Plus,
    Search,
} from "lucide-react";
import { getCarriersFromBackend } from "../../utilities/getCarriers";
import { message } from "antd";

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
    const [availableBalance, setAvailableBalance] = useState(0);

    const [selectedFilter, setSelectedFilter] = useState("company_id");
    const filterOptions = [
        { label: "Carrier", key: "company_id" },
        { label: "Amount", key: "amount" },
        { label: "Phone No", key: "phone_no" },
    ];
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [preFilter, setPreFilter] = useState("all");

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

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

    const loadBalance = async () => {
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-account-balance/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: JSON.parse(localStorage.getItem("userData")).username,
                    }),
                }
            );
            const data = await res.json();

            if (data.status === "success") {
                setAvailableBalance(data.data_received.account_balance_amount);
            }
        } catch (error) {
            console.error(error);
        }
    };

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


    const filteredData = useMemo(() => {
        return topUpHistory
            .filter((item) => {
                // 🔹 Step 1: Apply preFilter (status-based filtering)
                if (preFilter === "approved" && item.pending_status) return false;
                if (preFilter === "pending" && !item.pending_status) return false;

                return true;
            })
            .filter((item) => {
                // 🔹 Step 2: Apply search + selected filter
                let value = item[selectedFilter];

                if (selectedFilter === "timestamp" && value) {
                    value = new Date(value).toLocaleString();
                }

                if (!value) return false;

                return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [topUpHistory, selectedFilter, searchTerm, preFilter]);

    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem));
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    }, [filteredData, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFilter, preFilter]);

    useEffect(() => {
        loadData();
        loadBalance();
    }, []);

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
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 10) value = value.slice(0, 10);
        if (value.startsWith("0")) setError("Phone number cannot start with 0.");
        else setError("");
        setPhoneNumber(value);
    };

    const handleRePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 10) value = value.slice(0, 10);
        if (value.startsWith("0")) setError("Phone number cannot start with 0.");
        if (value !== phoneNumber) setError("Phone numbers do not match.");
        else setError("");
        setRephoneNumber(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCarrier) return setError("Please select a carrier.");

        if (!amount || amount % 5 !== 0 || amount < 5 || amount > 200)
            return setError("Enter a valid amount (5–200 in multiples of 5).");

        if (!phoneNumber || phoneNumber.length !== 10 || phoneNumber.startsWith("0"))
            return setError("Enter a valid 10-digit phone number (cannot start with 0).");

        if (amount > availableBalance)
            return setError("Insufficient balance for this top-up.");

        if (phoneNumber !== rephoneNumber)
            return setError("Phone numbers do not match.");

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

            let data = {};
            try {
                data = await res.json();
            } catch { }

            if (!res.ok) {
                return setError(
                    data.error || data.message || "Top-up failed. Please try again."
                );
            }

            message.success("Top-up successful!");

            localStorage.removeItem("selectedCarrierID");
            setIsAddingTopUp(false);
            loadData();
            loadBalance();
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
        <div className="bg-white shadow-lg rounded-lg py-4 overflow-hidden">
            <div className="bg-white z-20">
                <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center px-4 mb-4 gap-4">
                    <div className="flex gap-x-3 items-center">
                        <div className="bg-blue-100 p-2 w-fit rounded-xl shadow-inner">
                            <BanknoteArrowUp className="text-blue-700" size={38} />
                        </div>

                        <div>
                            <h1 className="text-gray-900 font-extrabold lg:text-xl md:text-lg text-base tracking-wide">
                                SIM Top-Up History
                            </h1>

                            <p className="text-gray-400/80 font-medium italic lg:text-base md:text-sm text-xs">
                                View and manage your SIM top-up history
                            </p>
                        </div>
                    </div>
                    {isAddingTopUp ? (
                        <button
                            onClick={() => {
                                setIsAddingTopUp(false);
                                setSelectedCarrier(null);
                                setAmount("");
                                setPhoneNumber("");
                                setRephoneNumber("");
                            }}
                            className="w-fit lg:self-auto self-end flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg 
                                   hover:bg-blue-700 transition"
                        >
                            <Delete size={18} /> Cancel
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsAddingTopUp(true)}
                            className="w-fit lg:self-auto self-end flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg 
                                   hover:bg-blue-700 transition"
                        >
                            <Plus size={18} /> Add Balance
                        </button>
                    )}

                </div>

                <hr className="py-2" />

                {/* Filters Header */}
                {!isAddingTopUp && (
                    <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 px-4 pb-5">
                        <div className="border rounded-lg text-sm w-fit">
                            <button
                                onClick={() => setPreFilter("all")}
                                className={`rounded-l-lg px-4 py-2 border-r ${preFilter === "all"
                                    ? "bg-blue-500 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setPreFilter("approved")}
                                className={`px-4 py-2 border-r ${preFilter === "approved"
                                    ? "bg-blue-500 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => setPreFilter("pending")}
                                className={`rounded-r-lg px-4 py-2 ${preFilter === "pending"
                                    ? "bg-blue-500 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                Pending
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer  text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <ListFilterIcon />
                                    <label className="cursor-pointer">Filters</label>
                                </div>

                                <div className="absolute z-50">
                                    {isFilterOpen && (
                                        <div className="bg-white border border-gray-300 rounded shadow-md p-2">
                                            {filterOptions.map((filter) => (
                                                <div
                                                    key={filter.key}
                                                    className={`cursor-pointer px-3 py-1 rounded ${selectedFilter === filter.key
                                                        ? "bg-blue-500 text-white"
                                                        : "text-gray-700"
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
                )}

            </div>

            {/* Table */}
            {isAddingTopUp ? (
                <div className="flex flex-col md:h-[67vh] h-[54vh] w-full">
                    <div className="flex-1 overflow-y-auto w-full md:px-20 px-4 py-1 ">
                        <label className="text-lg font-semibold mb-4 text-gray-700">Select Carrier</label>
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
                            className="border p-6 rounded-lg shadow-md bg-white gap-5 grid grid-cols-4"
                        >
                            <div className="md:col-span-3 col-span-full">
                                <label className="block font-medium mb-2 text-gray-700">
                                    Select Amount ($)
                                </label>
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

                            <div className="md:col-span-2 col-span-full">
                                <label className="block font-medium mb-2 text-gray-700">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Enter 10-digit number"
                                />
                            </div>

                            <div className="md:col-span-2 col-span-full">
                                <label className="block font-medium mb-2 text-gray-700">
                                    Re-enter Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={rephoneNumber}
                                    onChange={handleRePhoneChange}
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Enter 10-digit number"
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg col-span-full">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="col-span-full flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-fit py-2 px-6 rounded-lg font-semibold text-white transition 
                                ${isProcessing
                                            ? "bg-blue-300 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {isProcessing ? "Processing..." : "Confirm Top-Up"}
                                </button>
                            </div>


                        </form>
                    </div>
                    <div className="flex justify-between items-center mt-2 sticky bottom-0 bg-white md:px-8 px-4 pt-3 z-20 border-t">
                        <div className="text-gray-600 text-sm">
                            Available Account Balance: ${availableBalance}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col md:h-[59vh] h-[54vh] w-full">
                    <div className="flex-1 overflow-y-auto w-full md:px-0 px-4">
                        <table className="w-full text-sm text-gray-700 lg:inline-table hidden">
                            <thead className="bg-blue-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                                <tr>
                                    <th className="px-10 py-3 text-left">No</th>
                                    <th className="px-10 py-3 text-left">Number</th>
                                    <th className="px-10 py-3 text-left">Carrier</th>
                                    <th className="px-10 py-3 text-left">Amount</th>
                                    <th className="px-10 py-3 text-left">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentItems.length > 0 ? (
                                    [...currentItems]
                                        .reverse()
                                        .map((item, index) => (
                                            <tr
                                                key={item.recharge_id}
                                                className="border-t hover:bg-gray-50"
                                            >
                                                <td className="px-10 py-3 font-semibold">{index <= 8 ? `0${index + 1}` : index + 1}</td>
                                                <td className="px-10 py-3">{item.phone_no}</td>
                                                <td className="px-10 py-3">{item.company_id}</td>
                                                <td className="px-10 py-3 text-green-600 font-semibold">
                                                    $ {item.amount}
                                                </td>

                                                <td className="px-10 py-3">
                                                    {item.pending_status === false ? (
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
                                            colSpan="5"
                                            className="px-6 py-6 text-center text-gray-500"
                                        >
                                            No results found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex justify-between items-center mt-2 sticky bottom-0 bg-white md:px-8 px-4 pt-3 z-20 border-t">
                        <div className="text-gray-600 text-sm">
                            Records: {filteredData.length}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 
                                        disabled:opacity-40 hover:bg-gray-100 transition"
                                >
                                    <ChevronLeft size={18} className="text-gray-600" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                        (num) => (
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
                                        )
                                    )}
                                </div>

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


                        {topUpHistory.length > 10 && (
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
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

export default TopUp;
