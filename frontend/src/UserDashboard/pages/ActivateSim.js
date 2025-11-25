import React, { useEffect, useState } from "react";
import { Search, Edit2, Trash2, Plus, DeleteIcon, CircleDollarSign, ListFilterIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getCarriersFromBackend } from "../../utilities/getCarriers";
import { getPlansFromBackend } from "../../utilities/getPlans";
import { FaQuestion } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { message } from "antd";

function ActivateSim() {

    const location = useLocation()
    const fromDashboardAdd = location.state?.fromDashboardAdd || false;
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
    const [eid, setEid] = useState("");
    const [iccid, setIccid] = useState("");
    const [emi, setEmi] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [planDiscount, setPlanDiscount] = useState(0);
    const [payableAmount, setPayableAmount] = useState(0);

    const [formData, setFormData] = useState({
        simType: "Sim", // "Sim" or "E-Sim"
    });

    const [availableBalance, setAvailableBalance] = useState(0);

    const getUserPlanOffer = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-offers/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: JSON.parse(localStorage.getItem("userData")).username, })
                })
            const data = await res.json()
            const offers = data.offers
            const discount = offers.filter(offer => offer.plan_id === selectedPlan)
            setPlanDiscount(discount[0].discount_percentage)
            setPayableAmount(selectedPlanDetails.plan_price - (selectedPlanDetails.plan_price * discount[0].discount_percentage / 100))
            if (data.status === 'success') {
                message.success('Charges fetched successfully')
            } else {
                message.error(data.message || 'Failed to update charges')
            }
        } catch (err) { console.error(err); message.error('Server error') }
    }

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

    useEffect(() => {
        if (fromDashboardAdd) {
            setIsAddingSim(true);
        } else {
            setIsAddingSim(false);
        }
    }, [fromDashboardAdd])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
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

    const [sims, setSims] = useState([]);

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
            loadBalance();
            getUserPlanOffer();
        }
    }, [selectedCarrier, selectedPlan]);

    // Load current user's activation requests from backend
    const fetchUserActivations = async () => {
        try {
            const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null
            if (!userData || !userData.username) return
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-activation-data/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: userData.username })
                })
            const json = await res.json()
            if (json.status === 'success') {
                // json.data_received is a list of activation objects (from backend view)
                const mapped = (json.data_received || []).map((a) => ({
                    id: a.activation_id || a.id,
                    simNumber: a.phone_no,
                    carrier: a.company_id || a.company_id || 'Unknown',
                    EID: a.eid || '',
                    status: a.pending ? 'Pending' : 'Active',
                    plan_id: a.plan_id,
                    amount_charged: a.amount_charged,
                    email: a.email,
                    timestamp: a.timestamp
                }))
                setSims(mapped)
            }
        } catch (err) { console.error('fetchUserActivations error', err) }
    }

    useEffect(() => { fetchUserActivations() }, [])

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

    // ---- helper validators ----
    const isDigits = (s) => /^\d+$/.test(s || "");
    const isValidEmail = (s) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || "").trim());


    // ---- updated handleActivateSim with full validation that honors carrier required fields ----
    const handleActivateSim = async () => {
        setError("");

        const requiredFields = (selectedCarrierDetails && formData.simType === 'E-Sim')
            ? (selectedCarrierDetails.esim_required_fields || [])
            : (selectedCarrierDetails && formData.simType === 'Sim')
                ? (selectedCarrierDetails.physical_required_fields || [])
                : [];

        // SIM Number (phone_no)
        if (requiredFields.includes('phone_no')) {
            if (!simNumber?.trim()) { setError('Please enter the SIM number.'); return }
        }

        // ICCID validation: if required or provided
        if (requiredFields.includes('iccid') || iccid) {
            if (!iccid) { setError('Please enter ICCID (32 digits).'); return }
            if (!isDigits(iccid) || iccid.length !== 32) { setError('ICCID must be exactly 32 digits.'); return }
        }

        // EID (E-SIM) validation
        if (formData.simType === 'E-Sim') {
            if (requiredFields.includes('eid')) {
                if (!eid) { setError('Please enter EID for E-SIM.'); return }
                if (!isDigits(eid)) { setError('EID must contain digits only.'); return }
                if (eid.startsWith('0')) { setError('EID cannot start with 0.'); return }
                if (eid.length > 10) { setError('EID cannot be more than 10 digits.'); return }
            } else if (eid) {
                // if not required but provided, validate format
                if (!isDigits(eid) || eid.startsWith('0') || eid.length > 10) { setError('Invalid EID format.'); return }
            }
        }

        // EMI (physical SIM) validation
        if (formData.simType === 'Sim') {
            if (requiredFields.includes('emi')) {
                if (!emi) { setError('Please enter EMI for SIM type.'); return }
                if (!isDigits(emi)) { setError('EMI must contain digits only.'); return }
                if (emi.length > 15) { setError('EMI cannot be more than 15 digits.'); return }
            } else if (emi) {
                if (!isDigits(emi) || emi.length > 15) { setError('Invalid EMI format.'); return }
            }
        }

        // ZIP/Postal code
        if (requiredFields.includes('postal_code')) {
            if (!zipCode) { setError('Please enter Postal/ZIP Code.'); return }
            if (!isDigits(zipCode)) { setError('ZIP Code must contain digits only.'); return }
        } else if (zipCode && !isDigits(zipCode)) { setError('ZIP Code must contain digits only.'); return }

        // Email
        if (requiredFields.includes('email')) {
            if (!email) { setError('Please enter email.'); return }
            if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return }
        } else if (email && !isValidEmail(email)) { setError('Please enter a valid email address.'); return }

        // PIN code (optional always) - validate if present
        if (pinCode && !isDigits(pinCode)) { setError('PIN Code must contain digits only.'); return }

        // Account balance check
        if (selectedPlanDetails && typeof selectedPlanDetails.plan_price !== 'undefined') {
            const price = Number(selectedPlanDetails.plan_price)
            if (Number.isFinite(price) && availableBalance < price) { setError('Insufficient account balance'); return }
        }

        // Build payload according to backend expectations
        try {
            const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null
            const username = userData?.username || ''
            const payload = {
                username,
                plan_id: selectedPlan,
                phone_no: simNumber,
                amount_charged: Number(selectedPlanDetails?.plan_price || 0),
                offer: selectedPlanDetails?.off_percentage || 0,
                emi: formData.simType === 'Sim' ? emi : '',
                eid: formData.simType === 'E-Sim' ? eid : '',
                iccid,
                email: email || '',
                postal_code: zipCode || '',
                pinCode: pinCode || '',
            }

            console.log('Activate SIM payload:', payload)

            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/user-sim-activation/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            })
            const json = await res.json()
            if (json.status === 'success') {
                if (json.account_balance !== undefined) setAvailableBalance(json.account_balance)
                message.success(json.message || 'SIM activation request submitted')
                fetchUserActivations()

                // Reset fields & UI state
                setIsAddingSim(false)
                setSelectedCarrier(null)
                setSelectedPlan(null)
                setAddingDetails(false)
                setSimNumber('')
                setEid('')
                setIccid('')
                setEmi('')
                setZipCode('')
                setPinCode('')
                setEmail('')
                setError('')
            } else {
                if (json.message) { message.info(json.message) } else { message.error('Failed to submit activation') }
            }
        } catch (err) {
            console.error('handleActivateSim error', err)
            message.error('Server error while submitting activation')
        }
    }

    const cancelActivation = () => {
        setIsAddingSim(false);
        setSelectedCarrier(null);
        setSelectedPlan(null);
        setAddingDetails(false);
        setSimNumber("");
        setEid("");
        setIccid("");
        setEmi("");
        setZipCode("");
        setPinCode("");
        setEmail("");
        setError("");
    }

    // Determine which fields carrier requires for the selected SIM type
    const carrierRequiredFields = (selectedCarrierDetails && formData.simType === 'E-Sim')
        ? (selectedCarrierDetails.esim_required_fields || [])
        : (selectedCarrierDetails && formData.simType === 'Sim')
            ? (selectedCarrierDetails.physical_required_fields || [])
            : [];


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
                            onClick={cancelActivation}
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
                                                        name="simType"
                                                        value="Sim"
                                                        checked={formData.simType === "Sim"}
                                                        onChange={handleChange}
                                                    />
                                                    Sim
                                                </label>

                                                <label className="flex items-center gap-x-2">
                                                    <input
                                                        type="radio"
                                                        name="simType"
                                                        value="E-Sim"
                                                        checked={formData.simType === "E-Sim"}
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
                                                disabled={selectedCarrierDetails ? !carrierRequiredFields.includes('phone_no') : false}
                                                className={`w-full border px-4 py-2 rounded-lg mt-1 ${selectedCarrierDetails && !carrierRequiredFields.includes('phone_no') ? 'bg-gray-100 text-gray-500' : ''}`}
                                                placeholder="Enter SIM Number"
                                            />
                                        </div>

                                        {/* EID (for E-SIM) */}
                                        <div>
                                            <label className="text-sm font-medium">EID</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={eid}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, ""); // digits only
                                                        if (value.length > 10) value = value.slice(0, 10);
                                                        setEid(value);
                                                        setError("");
                                                    }}
                                                    className="w-full border px-4 py-2 rounded-lg mt-1 pr-10"
                                                    placeholder="Enter EID"
                                                    disabled={(selectedCarrierDetails ? !carrierRequiredFields.includes('eid') : false)}
                                                />
                                                {/* question mark + tooltip */}
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <div className="group relative">
                                                        <div className="p-1 rounded-full bg-gray-100 border">
                                                            <FaQuestion className="w-3.5 h-3.5 text-gray-600" />
                                                        </div>
                                                        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 mt-2 w-56 bg-black text-white text-xs p-2 rounded-md z-50">
                                                            EID: Up to 10 digits. Required for E-SIM. Cannot start with 0.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ICCID - required 24 digits */}
                                        <div>
                                            <label className="text-sm font-medium">ICCID {carrierRequiredFields.includes('iccid') && <span className="text-xs text-gray-500">(required 32 digits)</span>}</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={iccid}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, ""); // digits only
                                                        if (value.length > 32) value = value.slice(0, 32);
                                                        setIccid(value);
                                                        setError("");
                                                    }}
                                                    disabled={selectedCarrierDetails ? !carrierRequiredFields.includes('iccid') : false}
                                                    className={`w-full border px-4 py-2 rounded-lg mt-1 pr-10 ${selectedCarrierDetails && !carrierRequiredFields.includes('iccid') ? 'bg-gray-100 text-gray-500' : ''}`}
                                                    placeholder="Enter ICCID (32 digits)"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <div className="group relative">
                                                        <div className="p-1 rounded-full bg-gray-100 border">
                                                            <FaQuestion className="w-3.5 h-3.5 text-gray-600" />
                                                        </div>
                                                        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 mt-2 w-56 bg-black text-white text-xs p-2 rounded-md z-50">
                                                            ICCID must be exactly 32 numeric digits (no spaces).
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* EMI (required for SIM) */}
                                        <div>
                                            <label className="text-sm font-medium">EMI</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={emi}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, "");
                                                        if (value.length > 15) value = value.slice(0, 15);
                                                        setEmi(value);
                                                        setError("");
                                                    }}
                                                    disabled={(selectedCarrierDetails ? !carrierRequiredFields.includes('emi') : false)}
                                                    className={`w-full border px-4 py-2 rounded-lg mt-1 pr-10 ${selectedCarrierDetails && !carrierRequiredFields.includes('emi') ? 'bg-gray-100 text-gray-500' : ''}`}
                                                    placeholder="Enter EMI"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <div className="group relative">
                                                        <div className="p-1 rounded-full bg-gray-100 border">
                                                            <FaQuestion className="w-3.5 h-3.5 text-gray-600" />
                                                        </div>
                                                        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 mt-2 w-56 bg-black text-white text-xs p-2 rounded-md z-50">
                                                            EMI: Required for physical SIMs. Digits only, up to 15 characters.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">ZIP Code {carrierRequiredFields.includes('postal_code') && <span className="text-xs text-gray-500">(required)</span>}</label>
                                            <input
                                                type="text"
                                                value={zipCode}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, "");
                                                    if (value.length > 10) value = value.slice(0, 10);
                                                    setZipCode(value);
                                                    setError("");
                                                }}
                                                disabled={selectedCarrierDetails ? !carrierRequiredFields.includes('postal_code') : false}
                                                className={`w-full border px-4 py-2 rounded-lg mt-1 ${selectedCarrierDetails && !carrierRequiredFields.includes('postal_code') ? 'bg-gray-100 text-gray-500' : ''}`}
                                                placeholder="Enter ZIP Code"
                                            />
                                        </div>

                                        {/* PIN Code */}
                                        <div>
                                            <label className="text-sm font-medium">PIN Code</label>
                                            <input
                                                type="text"
                                                value={pinCode}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, "");
                                                    if (value.length > 10) value = value.slice(0, 10);
                                                    setPinCode(value);
                                                    setError("");
                                                }}
                                                disabled={selectedCarrierDetails ? !carrierRequiredFields.includes('pinCode') : false}
                                                className={`w-full border px-4 py-2 rounded-lg mt-1 ${selectedCarrierDetails && !carrierRequiredFields.includes('pinCode') ? 'bg-gray-100 text-gray-500' : ''}`}
                                                placeholder="Enter PIN Code"
                                            />
                                        </div>

                                        {/* Email with tooltip */}
                                        <div className="col-span-full flex items-center gap-x-4">
                                            <div className="w-full">
                                                <label className="text-sm font-medium">Email {carrierRequiredFields.includes('email') && <span className="text-xs text-gray-500">(required)</span>}</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={email}
                                                        disabled={selectedCarrierDetails ? !carrierRequiredFields.includes('email') : false}
                                                        onChange={(e) => {
                                                            setEmail(e.target.value);
                                                            setError("");
                                                        }}
                                                        className={`w-full border px-4 py-2 rounded-lg mt-1 pr-10 ${selectedCarrierDetails && !carrierRequiredFields.includes('email') ? 'bg-gray-100 text-gray-500' : ''}`}
                                                        placeholder="Enter your email"
                                                    />
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                        <div className="group relative">
                                                            <div className="p-1 rounded-full bg-gray-100 border">
                                                                <FaQuestion className="w-3.5 h-3.5 text-gray-600" />
                                                            </div>
                                                            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 mt-2 w-56 bg-black text-white text-xs p-2 rounded-md z-50">
                                                                Optional email - we will use this for receipts and support.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {error && <p className="text-red-600 mt-2">{error}</p>}

                                    {(selectedPlanDetails.plan_price !== 0 || selectedPlanDetails.plan_price !== '') && (
                                        <div className="bg-gray-50 p-5 rounded-xl shadow-sm border mt-4">
                                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Amount Summary</h3>

                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span>Base Amount</span>
                                                <span>${selectedPlanDetails?.plan_price}</span>
                                            </div>

                                            <div className="flex justify-between text-sm text-gray-600 mb-3">
                                                <span>Discount ({planDiscount}%)</span>
                                                <span>- ${(selectedPlanDetails.plan_price * planDiscount / 100).toFixed(2)}</span>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t my-3"></div>

                                            <div className="flex justify-between text-lg font-semibold text-gray-800">
                                                <span>Total Amount</span>
                                                <span>
                                                    ${payableAmount?.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

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
                            <p>Available balance: ${availableBalance}</p>
                            <p>Total payment: ${payableAmount}</p>
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
