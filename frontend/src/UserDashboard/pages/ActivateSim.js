import React, { useEffect, useState } from "react";
import { Search, Edit2, Trash2, Plus, DeleteIcon, CircleDollarSign, ListFilterIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getCarriersFromBackend } from "../../utilities/getCarriers";
import { getPlansFromBackend } from "../../utilities/getPlans";
import { FaQuestion } from "react-icons/fa";

function ActivateSim() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddingSim, setIsAddingSim] = useState(false);
    const [carriers, setCarriers] = useState([]);
    const [selectedCarrier, setSelectedCarrier] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const [addingDetails, setAddingDetails] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
    const [selectedCarrierDetails, setSelectedCarrierDetails] = useState(null);

    const [selctedFilter, setSelectedFilter] = useState("carrier");
    const filterOptions = [
        { label: "Carrier", key: "carrier" },
        { label: "Sim NO", key: "simNumber" },
    ];
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [preFilter, setPreFilter] = useState('All');

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const [simNumber, setSimNumber] = useState("");
    const [EID, setEID] = useState("");

    const [formData, setFormData] = useState({
        planType: "Sim",
    });

    const [error, setError] = useState(""); // For validation errors
    const [balance, setBalance] = useState(10); // Example account balance, you can fetch it from API

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const fetchCarriers = async () => {
            const response = await getCarriersFromBackend();
            setCarriers(response);
        };
        fetchCarriers();
    }, []);

    useEffect(() => {
        if (selectedCarrier !== null) {
            const fetchPlans = async () => {
                const response = await getPlansFromBackend();
                const filteredPlans = response.filter(
                    (plan) => plan.company_id === selectedCarrier
                );
                setPlans(filteredPlans);
            };
            fetchPlans();
        }
    }, [selectedCarrier]);

    const [sims, setSims] = useState([
        { id: 1, simNumber: "923001112233", carrier: "Telenor", status: "Active", EID: "Pakistan" },
        { id: 2, simNumber: "447700900123", carrier: "Vodafone UK", status: "Inactive", EID: "United Kingdom" },
        { id: 3, simNumber: "971500123456", carrier: "Etisalat", status: "Active", EID: "UAE" },
    ]);

    const handleSelectCarrier = (carrier) => {
        setSelectedCarrier(carrier.company_id);
        setSelectedCarrierDetails(carrier);
        setSelectedPlan(null);
        setAddingDetails(false);
        setError("");
    };

    const filteredSims = sims.filter((sim) =>
        sim.simNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this SIM?")) {
            setSims((prev) => prev.filter((sim) => sim.id !== id));
        }
    };

    useEffect(() => {
        if (selectedCarrier && selectedPlan) {
            setAddingDetails(true);
        }
    }, [selectedCarrier, selectedPlan]);

    const filteredData = React.useMemo(() => {
        return sims
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
    }, [sims, selctedFilter, searchTerm, preFilter]);


    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem));
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    }, [filteredData, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selctedFilter]);

    const handleActivateSim = () => {
        // Validation
        if (!simNumber || !EID) {
            setError("Please fill all details!");
            return;
        }

        if (EID.startsWith("0")) {
            setError("EID cannot start with 0");
            return;
        }

        if (EID.length > 10) {
            setError("EID cannot be more than 10 digits");
            return;
        }

        if (balance < selectedPlanDetails.plan_price) {
            setError("Insufficient account balance");
            return;
        }

        const carrierName = carriers.find((c) => c.company_id === selectedCarrier)?.name;

        const newSim = {
            id: sims.length + 1,
            simNumber,
            EID,
            carrier: carrierName || "Unknown",
            status: "Active",
        };

        setSims([...sims, newSim]);

        // Deduct balance
        setBalance((prev) => prev - selectedPlanDetails.plan_price);

        // Reset
        setIsAddingSim(false);
        setSelectedCarrier(null);
        setSelectedPlan(null);
        setAddingDetails(false);
        setSimNumber("");
        setEID("");
        setError("");

        alert("SIM Activated Successfully!");
    };

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
                                Sim Activation
                            </h1>

                            <p className="text-gray-400/80 font-medium italic lg:text-base md:text-sm text-xs">
                                View and manage your SIM cards
                            </p>
                        </div>
                    </div>
                    {isAddingSim ? (
                        <button
                            onClick={() => {
                                setIsAddingSim(false)
                                setSelectedCarrier(null);
                                setSelectedPlan(null);
                                setAddingDetails(false);
                                setError("");
                            }}
                            className="w-fit lg:self-auto self-end flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg 
                                   hover:bg-blue-700 transition"
                        >
                            <DeleteIcon size={18} /> Cancel
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsAddingSim(true)}
                            className="w-fit lg:self-auto self-end flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg 
                                   hover:bg-blue-700 transition"
                        >
                            <Plus size={18} /> Activate New SIM
                        </button>
                    )}
                </div>

                <hr className="py-2" />

                {/* Header */}
                {isAddingSim || addingDetails ? null : (
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
                )}

            </div>

            {/* STEP 1 — Carrier + Plan Selection */}
            {
                isAddingSim && !addingDetails && (
                    <div className="flex flex-col md:h-[67vh] h-[54vh] w-full">

                        <div className="flex-1 overflow-y-auto w-full md:px-20 px-4">
                            <label className="text-lg font-medium mb-2 block">Choose Your Carrier</label>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 mb-4">
                                {carriers.map((carrier, index) => {
                                    const isSelected = selectedCarrier === carrier.company_id;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleSelectCarrier(carrier)}
                                            className={`border p-4 rounded-lg shadow transition cursor-pointer 
                                        ${isSelected
                                                    ? "border-blue-500 ring-2 ring-blue-300 bg-blue-50"
                                                    : "hover:shadow-lg"
                                                }`}
                                        >
                                            <img
                                                src={carrier.logo_url}
                                                alt={carrier.name}
                                                className="w-full h-20 object-contain mb-4"
                                            />
                                            <h3 className={`text-lg font-medium text-center ${isSelected ? "text-blue-600 font-semibold" : ""}`}>
                                                {carrier.name}
                                            </h3>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedCarrier && (
                                <>
                                    <h2 className="text-lg font-medium mb-3">Choose a Plan</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                        {plans.length > 0 ? (
                                            plans.map((plan, i) => {
                                                const isSelected = selectedPlan === plan.plan_id;

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => {
                                                            setSelectedPlan(plan.plan_id);
                                                            setSelectedPlanDetails(plan);
                                                        }}
                                                        className={`p-5 rounded-xl border shadow cursor-pointer transition relative
                                                    ${isSelected ? "border-blue-500 bg-blue-50 shadow-lg" : "hover:shadow-md"}
                                                `}
                                                    >
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                            {plan.plan_name}
                                                        </h3>

                                                        <ul className="text-gray-700 text-sm space-y-1 mb-3">
                                                            {plan.plan_feature?.map((f, idx) => (
                                                                <li key={idx}>• {f}</li>
                                                            ))}
                                                        </ul>

                                                        <div className="flex items-center gap-3 mt-3">
                                                            <span className="text-2xl font-bold text-blue-600">
                                                                ${plan.plan_price}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {plan.plan_duration} • {plan.plan_type}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-gray-500 italic">No plans available.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            {/* STEP 2 — Additional User Details */}
            {
                isAddingSim && addingDetails && (
                    <div className="flex flex-col md:h-[67vh] h-[54vh] w-full">

                        {/* Scrollable table body */}
                        <div className="flex-1 overflow-y-auto w-full md:px-20 px-4">
                            <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* LEFT SIDEBAR — SELECTED CARRIER + PLAN */}
                                <div className="space-y-4">

                                    {/* Carrier Card */}
                                    <div className="border p-4 rounded-lg shadow bg-blue-50 ring-2 ring-blue-300">
                                        <img
                                            src={selectedCarrierDetails.logo_url}
                                            alt={selectedCarrierDetails.name}
                                            className="w-full h-20 object-contain mb-4"
                                        />
                                        <h3 className="text-lg text-center text-blue-600 font-semibold">
                                            {selectedCarrierDetails.name}
                                        </h3>

                                        <button
                                            onClick={() => {
                                                setSelectedCarrier(null);
                                                setSelectedPlan(null);
                                                setAddingDetails(false);
                                                setError("");
                                            }}
                                            className="mt-3 w-full bg-white border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition"
                                        >
                                            Change Carrier
                                        </button>
                                    </div>

                                    {/* Plan Card */}
                                    <div className="p-5 rounded-xl border shadow bg-blue-50 border-blue-500">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                            {selectedPlanDetails.plan_name}
                                        </h3>

                                        <ul className="text-gray-700 text-sm space-y-1 mb-3">
                                            {selectedPlanDetails.plan_feature?.map((f, idx) => (
                                                <li key={idx}>• {f}</li>
                                            ))}
                                        </ul>

                                        <div className="flex items-center gap-3 mt-3">
                                            <span className="text-2xl font-bold text-blue-600">
                                                ${selectedPlanDetails.plan_price}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {selectedPlanDetails.plan_duration} • {selectedPlanDetails.plan_type}
                                        </p>

                                        <button
                                            onClick={() => {
                                                setSelectedPlan(null);
                                                setAddingDetails(false);
                                                setError("");
                                            }}
                                            className="mt-3 w-full bg-white border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition"
                                        >
                                            Change Plan
                                        </button>
                                    </div>
                                </div>

                                {/* RIGHT SIDE - SIM FORM */}
                                <div className="lg:col-span-2">
                                    <h2 className="text-xl font-semibold mb-4">Enter SIM Details</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-full">
                                            <label className="text-sm font-medium">SIM Type</label>
                                            <div className="flex items-center gap-x-8 mt-2">
                                                <label className="flex items-center gap-x-2">
                                                    <input
                                                        type="radio"
                                                        name="planType"
                                                        value="Sim"
                                                        checked={formData.planType === "Sim"}
                                                        onChange={handleChange}
                                                    />
                                                    Sim
                                                </label>

                                                <label className="flex items-center gap-x-2">
                                                    <input
                                                        type="radio"
                                                        name="planType"
                                                        value="E-Sim"
                                                        checked={formData.planType === "E-Sim"}
                                                        onChange={handleChange}
                                                    />
                                                    E-Sim
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">SIM Number</label>
                                            <input
                                                type="text"
                                                value={simNumber}
                                                onChange={(e) => setSimNumber(e.target.value)}
                                                className="w-full border px-4 py-2 rounded-lg mt-1"
                                                placeholder="Enter SIM Number"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">EID</label>
                                            <input
                                                type="text"
                                                value={EID}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, ""); // digits only
                                                    if (value.length > 10) value = value.slice(0, 10);
                                                    setEID(value);
                                                    setError("");
                                                }}
                                                className="w-full border px-4 py-2 rounded-lg mt-1"
                                                placeholder="Enter EID"
                                            />
                                        </div>

                                        <div className="col-span-full flex items-center gap-x-4">
                                            <div className="w-full">
                                                <label className="text-sm font-medium">Email</label>
                                                <input
                                                    type="text"
                                                    value={EID}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, ""); // digits only
                                                        if (value.length > 10) value = value.slice(0, 10);
                                                        setEID(value);
                                                        setError("");
                                                    }}
                                                    className="w-full border px-4 py-2 rounded-lg mt-1"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                            <FaQuestion className="mt-6 ml-2" />
                                        </div>
                                    </div>

                                    {error && <p className="text-red-600 mt-2">{error}</p>}

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleActivateSim}
                                            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                                        >
                                            Confirm Activation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 sticky bottom-0 bg-white md:px-8 px-4 pt-3 z-20 border-t">
                            <p>Available balance: ${balance}</p>
                            <p>Total payment: ${selectedPlanDetails.plan_price}</p>
                        </div>
                    </div>
                )
            }

            {/* SIM TABLE */}
            {
                !isAddingSim && !addingDetails && (
                    <div className="flex flex-col md:h-[59vh] h-[54vh] w-full">

                        {/* Scrollable table body */}
                        <div className="flex-1 overflow-y-auto w-full md:px-0 px-4">

                            <table className="w-full  text-sm text-gray-700 lg:inline-table hidden">
                                <thead className="bg-blue-50 text-gray-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-10 py-3 text-left">SIM Number</th>
                                        <th className="px-10 py-3 text-left">Carrier</th>
                                        <th className="px-10 py-3 text-left">EID</th>
                                        <th className="px-10 py-3 text-left">Status</th>
                                        <th className="px-10 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems.length > 0 ? (
                                        filteredSims.map((sim) => (
                                            <tr key={sim.id} className="border-t hover:bg-gray-50 transition">
                                                <td className="px-10 py-3 font-medium">{sim.simNumber}</td>
                                                <td className="px-10 py-3">{sim.carrier}</td>
                                                <td className="px-10 py-3">{sim.EID}</td>

                                                <td className="px-10 py-3">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium 
                                                    ${sim.status === "Active"
                                                                ? "bg-green-100 text-green-600"
                                                                : "bg-red-100 text-red-600"
                                                            }`}
                                                    >
                                                        {sim.status}
                                                    </span>
                                                </td>

                                                <td className="px-10 py-3 flex justify-center gap-3">
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(sim.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-6 text-center text-gray-500 italic">
                                                No SIMs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between items-center mt-2 sticky bottom-0 bg-white md:px-8 px-4 pt-3 z-20 border-t">

                            {/* Left side text */}
                            <div className="text-gray-600 text-sm">
                                Available Balance:  USD
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
                )
            }
        </div >
    );
}

export default ActivateSim;
