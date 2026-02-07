import React, { useEffect, useState } from "react";
import { Search, Edit2, Trash2, Plus, DeleteIcon, CircleDollarSign, ListFilterIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getCarriersFromBackend } from "../../utilities/getCarriers";
import { getPlansFromBackend } from "../../utilities/getPlans";
import { FaQuestion } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { message, Spin } from "antd";

function ActivateSim() {

    const location = useLocation()
    const fromDashboardAdd = location.state?.fromDashboardAdd || false;
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddingSim, setIsAddingSim] = useState(false);
    const [carriers, setCarriers] = useState([]);
    const [selectedCarrier, setSelectedCarrier] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedSim, setSelectedSim] = useState("Sim");

    const [addingDetails, setAddingDetails] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
    const [selectedCarrierDetails, setSelectedCarrierDetails] = useState(null);

    const [selctedFilter, setSelectedFilter] = useState("carrier");
    const filterOptions = [
        { label: "Carrier", key: "carrier" },
        { label: "Sim NO", key: "simNumber" },
    ];
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [preFilter, setPreFilter] = useState('all');

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
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        simType: "Sim", // "Sim" or "E-Sim"
    });

    const [availableBalance, setAvailableBalance] = useState(0);
    const [editingActivationId, setEditingActivationId] = useState(null);
    const [originalEmail, setOriginalEmail] = useState(""); // Track original email when editing

    // Email Verification States
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [sentVerificationCode, setSentVerificationCode] = useState(null);
    const [isVerificationSending, setIsVerificationSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const [resendCountdown, setResendCountdown] = useState(0);

    const getUserPlanOffer = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-user-offers/`,
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
                `${process.env.REACT_APP_API_URL}/api/get-user-account-balance/`,
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
            setIsLoadingPlans(true);
            const fetchPlans = async () => {
                const response = await getPlansFromBackend();
                const filteredPlans = response.filter(
                    (plan) => plan.company_id === selectedCarrier
                );
                setPlans(filteredPlans);
                setIsLoadingPlans(false);
            };
            fetchPlans();
        }
    }, [selectedCarrier]);

    const [sims, setSims] = useState([]);

    const handleSelectCarrier = (carrier) => {
        if (editingActivationId) { message.info('Cannot change carrier while editing an activation'); return }
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
        setIsLoading(true)
        try {
            const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null
            if (!userData || !userData.username) return
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-user-activation-data/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: userData.username })
                })
            const json = await res.json()
            if (json.status === 'success') {
                const mapped = (json.data_received || []).map((a) => ({
                    id: a.activation_id || a.id,
                    simNumber: a.phone_no,
                    carrier: a.company_id || a.company_id || 'Unknown',
                    EID: a.eid || '',
                    status: a.status,
                    simType: a.sim_type || 'Sim',
                    ...a
                }))
                const sortedData = [...mapped].sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );
                setSims(sortedData)
            }
        } catch (err) { console.error('fetchUserActivations error', err) }
        finally { setIsLoading(false) }

    }

    useEffect(() => { fetchUserActivations() }, [])

    const filteredData = React.useMemo(() => {
        return sims
            .filter((item) => {
                // 🔹 Step 1: Apply preFilter (status-based filtering)
                if (preFilter === "approved" && item.status !== "Approved") return false;
                if (preFilter === "pending" && item.status !== "Pending") return false;

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

        // Check if email verification is required
        if (editingActivationId) {
            if (email !== originalEmail) {
                if (carrierRequiredFields.includes('email') && !isEmailVerified) {
                    setError('Please verify your email address first');
                    return;
                }
            }
        } else {
            if (carrierRequiredFields.includes('email') && !isEmailVerified) {
                setError('Please verify your email address first');
                return;
            }
        }

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

        // Account balance check (skip when updating an existing activation)
        if (!editingActivationId && selectedPlanDetails && typeof selectedPlanDetails.plan_price !== 'undefined') {
            const price = Number(selectedPlanDetails.plan_price)
            if (Number.isFinite(price) && availableBalance < price) { setError('Insufficient account balance'); return }
        }

        // Build payload according to backend expectations
        try {
            const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null
            const username = userData?.username || ''
            const payload = {
                username,
                sim_type: formData.simType,
                plan_id: selectedPlan,
                company_id: selectedCarrier,
                phone_no: simNumber,
                amount_charged: payableAmount,
                amount: Number(selectedPlanDetails?.plan_price || 0),
                emi: formData.simType === 'Sim' ? emi : '',
                eid: formData.simType === 'E-Sim' ? eid : '',
                iccid,
                email: email || '',
                postal_code: zipCode || 0,
                pin_code: pinCode || 0,
            }

            // If editing an existing activation, call update endpoint
            if (editingActivationId) {
                const updatePayload = { activation_id: editingActivationId, username, ...payload };
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/update-activation/`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatePayload)
                });
                const json = await res.json();
                if (json.status === 'success') {
                    message.success(json.message || 'Activation updated');
                    // reset edit state
                    setEditingActivationId(null);
                    fetchUserActivations();
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
                    return;
                } else {
                    if (json.message) { message.info(json.message) } else { message.error('Failed to update activation') }
                    return;
                }
            }

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user-sim-activation/`, {
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

    const startEdit = async (act) => {
        try {
            if (!act) return message.error('Activation not found');

            setEditingActivationId(act.activation_id);
            setSelectedCarrier(act.company_id);
            const carrierObj = carriers.find(c => c.company_id === act.company_id) || null;
            setSelectedCarrierDetails(carrierObj);

            // load plans for the carrier and set selected plan details
            const allPlans = await getPlansFromBackend();
            const filteredPlans = allPlans.filter(p => p.company_id === act.company_id);
            setPlans(filteredPlans);
            setSelectedPlan(act.plan_id);
            const planDet = filteredPlans.find(p => p.plan_id === act.plan_id) || null;
            setSelectedPlanDetails(planDet);
            setSelectedSim(act.sim_type || "Sim");

            setSimNumber(act.phone_no || '');
            setEid(act.eid || '');
            setIccid(act.iccid || '');
            setEmi(act.emi || '');
            setZipCode(act.postal_code || '');
            setPinCode(act.pin_code || '');
            setEmail(act.email || '');
            setOriginalEmail(act.email || ''); // Store original email for comparison
            setPayableAmount(Number(act.amount_charged) || 0);

            // Set sim_type in formData
            setFormData(prev => ({ ...prev, simType: act.sim_type || 'Sim' }));

            // Reset email verification state - user will need to re-verify if they edit the email
            setIsEmailVerified(false);
            setVerificationCode('');
            setSentVerificationCode(null);
            setVerificationError('');
            setResendCountdown(0);

            setIsAddingSim(true);
            setAddingDetails(true);
            loadBalance();
        } catch (err) {
            console.error('startEdit error', err);
            message.error('Failed to start editing');
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
        setOriginalEmail("");
        setError("");
        setEditingActivationId(null);
        setSelectedSim("Sim");
        setFormData({ simType: "Sim" });
        setIsEmailVerified(false);
        setVerificationCode("");
        setSentVerificationCode(null);
        setVerificationError("");
        setResendCountdown(0);
    }

    // Generate a random 6-digit verification code
    const generateVerificationCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Send verification code to email
    const handleSendVerificationCode = async () => {
        setVerificationError("");
        if (!email || !isValidEmail(email)) {
            setVerificationError("Please enter a valid email address");
            return;
        }

        setIsVerificationSending(true);
        try {
            const code = generateVerificationCode();
            setSentVerificationCode(code);
            setIsVerifyModalOpen(true);
            setVerificationCode("");
            setResendCountdown(30); // 30 seconds countdown

            // Mock API call - Replace with actual backend call
            // In real implementation, send to backend which will email the code
            // const res = await fetch(`${process.env.REACT_APP_API_URL}/api/send-verification-code/`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email, code })
            // });
            // const data = await res.json();

            message.success(`Verification code sent to ${email}`);
            console.log("Verification Code (Development):", code); // For testing
        } catch (err) {
            console.error(err);
            setVerificationError("Failed to send verification code. Please try again.");
        } finally {
            setIsVerificationSending(false);
        }
    };

    // Verify the code entered by user
    const handleVerifyCode = async () => {
        setVerificationError("");
        if (!verificationCode || verificationCode.trim() === "") {
            setVerificationError("Please enter the verification code");
            return;
        }

        if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
            setVerificationError("Verification code must be 6 digits");
            return;
        }

        setIsVerifying(true);
        try {
            // In real implementation, verify with backend
            // const res = await fetch(`${process.env.REACT_APP_API_URL}/api/verify-code/`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email, code: verificationCode })
            // });
            // const data = await res.json();

            // Mock verification - In development, any 6-digit code works
            // In production, verify against sentVerificationCode or backend response
            if (verificationCode === sentVerificationCode) {
                setIsEmailVerified(true);
                setIsVerifyModalOpen(false);
                message.success("Email verified successfully!");
            } else {
                setVerificationError("Invalid verification code. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setVerificationError("Verification failed. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

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
                            <label className="text-lg font-semibold mb-2 block">Choose Your Carrier</label>

                            {carriers.length === 0 ? (
                                <p className="text-gray-500 italic">No carriers available.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-4 mb-4">
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
                                                    className="w-full h-12 object-contain mb-4"
                                                />
                                                <h3 className={`text-lg font-medium text-center ${isSelected ? "text-blue-600 font-semibold" : ""}`}>
                                                    {carrier.name}
                                                </h3>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedCarrier && (
                                <>
                                    <h2 className="text-lg font-medium mb-2">Choose a Plan</h2>

                                    {isLoadingPlans ? (
                                        <div className=" text-gray-500">
                                            <Spin />
                                        </div>
                                    ) : (
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
                                    )}


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
                                                if (editingActivationId) { message.info('Cannot change carrier while editing'); return }
                                                setSelectedCarrier(null);
                                                setSelectedPlan(null);
                                                setAddingDetails(false);
                                                setError("");
                                            }}
                                            className={`mt-3 w-full bg-white border border-blue-600 text-blue-600 py-2 rounded-lg ${editingActivationId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100 transition'}`}
                                            disabled={!!editingActivationId}
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
                                                if (editingActivationId) { message.info('Cannot change plan while editing'); return }
                                                setSelectedPlan(null);
                                                setAddingDetails(false);
                                                setError("");
                                            }}
                                            className={`mt-3 w-full bg-white border border-blue-600 text-blue-600 py-2 rounded-lg ${editingActivationId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100 transition'}`}
                                            disabled={!!editingActivationId}
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
                                        <div className="col-span-full flex items-center gap-x-2">
                                            <div className="w-full">
                                                <label className="text-sm font-medium">Email {carrierRequiredFields.includes('email') && <span className="text-xs text-gray-500">(required)</span>}</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={email}
                                                        disabled={selectedCarrierDetails ? !carrierRequiredFields.includes('email') : false}
                                                        onChange={(e) => {
                                                            setEmail(e.target.value);
                                                            // Reset email verification if email changes from original (during edit)
                                                            if (editingActivationId && e.target.value !== originalEmail) {
                                                                setIsEmailVerified(false);
                                                            }
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
                                                                This email will be used for SIM activation and communications.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-end h-full">
                                                <button
                                                    onClick={handleSendVerificationCode}
                                                    disabled={!email || !isValidEmail(email) || isEmailVerified || isVerificationSending || (editingActivationId && email === originalEmail)}
                                                    className={`rounded-md h-fit px-4 py-2 font-medium transition ${isEmailVerified
                                                        ? 'bg-green-600 text-white cursor-default'
                                                        : editingActivationId && email === originalEmail
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : isVerificationSending
                                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                                : !email || !isValidEmail(email)
                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {isEmailVerified ? 'Verified' : editingActivationId && email === originalEmail ? 'Verified' : isVerificationSending ? 'Sending...' : 'Verify'}
                                                </button>
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
                                                <span>- ${(selectedPlanDetails.plan_price * planDiscount / 100)?.toFixed(2)}</span>
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
                                            {editingActivationId ? 'Update Activation' : 'Confirm Activation'}
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
                                <thead className="bg-blue-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                                    <tr>
                                        <th className="px-10 py-3 text-left">No</th>
                                        <th className="px-10 py-3 text-left">Date</th>
                                        <th className="px-10 py-3 text-left">SIM Number</th>
                                        <th className="px-10 py-3 text-left">Carrier</th>
                                        <th className="px-10 py-3 text-left">EID</th>
                                        <th className="px-10 py-3 text-left">Status</th>
                                        <th className="px-10 py-3 text-end">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={7} className="h-[40vh] text-gray-500">
                                                <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                                                    <Spin />
                                                    <span>Loading SIM History...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentItems.length > 0 ? (
                                        currentItems.map((sim, index) => (
                                            <tr key={index} className="border-t hover:bg-gray-50 transition">
                                                <td className="px-10 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="px-10 py-3">{new Date(sim.timestamp).toLocaleDateString()}</td>
                                                <td className="px-10 py-3 font-medium">{sim.simNumber}</td>
                                                <td className="px-10 py-3">{sim.carrier}</td>
                                                <td className="px-10 py-3">{sim.EID}</td>

                                                <td className="px-10 py-3">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium 
                                                    ${sim.status === "Approved"
                                                                ? "bg-green-100 text-green-600"
                                                                : "bg-red-100 text-red-600"
                                                            }`}
                                                    >
                                                        {sim.status}
                                                    </span>
                                                </td>

                                                <td className="px-10 py-3 flex justify-end gap-3">
                                                    {sim.status === "Pending" && (
                                                        <button onClick={() => startEdit(sim)} className="text-blue-600 hover:text-blue-800">
                                                            <Edit2 size={18} />
                                                        </button>
                                                    )}
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
                                            <td colSpan="7" className="py-10">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    {/* Icon */}
                                                    <div className="mb-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-16 h-16 text-gray-400"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M9 13h6m2 8H7a2 2 0 01-2-2V7a2 2 0 012-2h3.5L12 7h5a2 2 0 012 2v10a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                    </div>

                                                    {/* Text */}
                                                    <p className="text-lg font-semibold text-gray-600">No Related Data</p>
                                                    <p className="text-sm text-gray-400 mb-4">
                                                        Try adjusting your filters or add a new entry.
                                                    </p>

                                                    {/* Button */}
                                                    <button
                                                        onClick={() => setIsAddingSim(true)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        Add New
                                                    </button>
                                                </div>
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

            {/* EMAIL VERIFICATION MODAL */}
            {isVerifyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
                            <button
                                onClick={() => setIsVerifyModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Email Display */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600 mb-1">Verification code sent to</p>
                            <p className="text-lg font-semibold text-blue-600 break-all">{email}</p>
                        </div>

                        {/* Verification Code Input */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Enter 6-digit code
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');
                                    if (value.length > 6) value = value.slice(0, 6);
                                    setVerificationCode(value);
                                    setVerificationError('');
                                }}
                                maxLength="6"
                                placeholder="000000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold tracking-widest transition"
                            />
                            {verificationError && (
                                <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                                    <span className="text-lg">⚠️</span> {verificationError}
                                </p>
                            )}
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerifyCode}
                            disabled={isVerifying || verificationCode.length !== 6}
                            className={`w-full py-3 rounded-lg font-semibold transition mb-4 ${isVerifying || verificationCode.length !== 6
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                }`}
                        >
                            {isVerifying ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spin size="small" /> Verifying...
                                </span>
                            ) : (
                                'Verify Email'
                            )}
                        </button>

                        {/* Resend Code */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Didn't receive code?
                            </p>
                            <button
                                onClick={handleSendVerificationCode}
                                disabled={resendCountdown > 0 || isVerificationSending}
                                className={`text-sm font-medium transition ${resendCountdown > 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : isVerificationSending
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-blue-600 hover:text-blue-700'
                                    }`}
                            >
                                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
                            </button>
                        </div>

                        {/* Info Message */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                We sent a 6-digit verification code to your email. Please check your inbox and spam folder.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

export default ActivateSim;
