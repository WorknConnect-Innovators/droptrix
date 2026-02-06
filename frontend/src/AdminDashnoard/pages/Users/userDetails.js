import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { User, Mail, BadgeCheck, Plus, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { message } from 'antd';
import { getCarriersFromBackend } from '../../../utilities/getCarriers';
import { companyBasedPlans } from '../../../utilities/getPlans';

function UserDetails() {

    const location = useLocation();
    const { user } = location.state || {};
    const [userData, setUserData] = useState({});
    const [loadingUserData, setLoadingUserData] = useState(false);
    const [rechargeCharges, setRechargeCharges] = useState(0)
    const [rechargeDiscounts, setRechargeDiscounts] = useState(0);
    const [saving, setSaving] = useState(false);
    const [loadingChargesData, setLoadingChargesData] = useState(false);
    const [isReChange, setIsReChange] = useState(false);
    const [carriers, setCarriers] = useState([]);
    const [loadingCarriers, setLoadingCarriers] = useState(false);
    const [selectedCarrier, setSelectedCarrier] = useState('');
    const [carrierDiscounts, setCarrierDiscounts] = useState(0);
    const [isTopUpChange, setIsTopUpChange] = useState(false);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [selPlanCarrier, setSelPlanCarrier] = useState('');
    const [planDiscount, setPlanDiscount] = useState(0);
    const [isPlanChange, setIsPlanChange] = useState(false);
    const [plansData, setPlansData] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [planOffersOpen, setPlanOffersOpen] = useState(false);
    const [userPlanOffers, setUserPlanOffers] = useState([])
    const [userCarrierOffers, setUserCarrierOffers] = useState([])
    const [carrierOffersOpen, setCarrierOffersOpen] = useState(false);
    const [loadingUserPlanOffers, setLoadingUserPlanOffers] = useState(false);
    const [loadingUserCarrierOffers, setLoadingUserCarrierOffers] = useState(false);

    // Admin-on-behalf states: Account Fund, Topup, Activation
    const [adminFundAmount, setAdminFundAmount] = useState("");
    const [adminFundScreenshot, setAdminFundScreenshot] = useState("");
    const [adminFundUploading, setAdminFundUploading] = useState(false);
    const [adminFundSubmitting, setAdminFundSubmitting] = useState(false);
    const [adminFundPayable, setAdminFundPayable] = useState(0);

    const [adminTopupCarrier, setAdminTopupCarrier] = useState(null);
    const [adminTopupAmount, setAdminTopupAmount] = useState("");
    const [adminTopupPhone, setAdminTopupPhone] = useState("");
    const [adminTopupSubmitting, setAdminTopupSubmitting] = useState(false);
    const [adminTopupPayable, setAdminTopupPayable] = useState(0);
    const [adminTopupCompanyDiscount, setAdminTopupCompanyDiscount] = useState(0);

    const [adminActCarrier, setAdminActCarrier] = useState("");
    const [adminActPlans, setAdminActPlans] = useState([]);
    const [adminActPlan, setAdminActPlan] = useState("");
    const [adminActSimType, setAdminActSimType] = useState("Sim");
    const [adminActSimNumber, setAdminActSimNumber] = useState("");
    const [adminActEid, setAdminActEid] = useState("");
    const [adminActIccid, setAdminActIccid] = useState("");
    const [adminActEmi, setAdminActEmi] = useState("");
    const [adminActEmail, setAdminActEmail] = useState("");
    const [adminActSubmitting, setAdminActSubmitting] = useState(false);
    const [adminActPayable, setAdminActPayable] = useState(0);
    const [adminActCarrierDetails, setAdminActCarrierDetails] = useState(null);
    const [adminActZip, setAdminActZip] = useState("");
    const [adminActPin, setAdminActPin] = useState("");

    const loadData = async () => {
        setLoadingUserData(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user-dashboard-summary/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user.username }),
            });

            if (!res.ok) throw new Error("Failed to fetch data");

            const data = await res.json();
            setUserData(data.data_received || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingUserData(false);
        }
    };

    const loadDiscountCharges = async () => {
        setLoadingChargesData(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/get-user-charges-discount/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user.username })
                })
            const data = await res.json()
            if (data.status === 'success') {
                const receivedData = data?.data_received || {}

                setRechargeCharges(receivedData.recharge_charges || 0)
                setRechargeDiscounts(receivedData.recharge_discount || 0)
            }

        }
        catch (err) {
            console.error(err);
        } finally {
            setLoadingChargesData(false);
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        loadData()
        loadDiscountCharges()
    }, []);

    const handleSaveCharges = async () => {
        const Dr = Number(rechargeDiscounts)
        const Cr = Number(rechargeCharges)
        if (isNaN(Dr) || isNaN(Cr)) { message.error('Please enter valid numeric values for taxes'); return }

        setSaving(true)
        try {
            const payload =
            {
                usernames: [user.username],
                recharge_charges: Cr,
                recharge_discount: Dr,
            }
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/update-charges-discount/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            const data = await res.json()
            if (data.status === 'success') {
                message.success('Charges updated successfully')
            } else {
                message.error(data.message || 'Failed to update charges')
            }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setSaving(false) }
    }

    const handleSaveCarrierDiscount = async () => {

        setSaving(true)
        try {
            const payload =
            {
                username: user.username,
                company_id: selectedCarrier,
                discount_percentage: Number(carrierDiscounts),
            }
            console.log(payload)
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/add-company-offer/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            const data = await res.json()
            console.log(data)
            if (data.status === 'success') {
                message.success('Charges updated successfully')
            } else {
                message.error(data.message || 'Failed to update charges')
            }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setSaving(false) }
    }

    const handleSavePlanDiscount = async () => {

        setSaving(true)
        try {
            const payload =
            {
                username: user.username,
                plan_id: selectedPlan,
                discount_percentage: Number(planDiscount),
            }
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/add-user-offer/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            const data = await res.json()
            if (data.status === 'success') {
                message.success('Charges updated successfully')
            } else {
                message.error(data.message || 'Failed to update charges')
            }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setSaving(false) }
    }


    useEffect(() => {
        const fetchCarriers = async () => {
            setLoadingCarriers(true);
            try {
                const result = await getCarriersFromBackend();
                setCarriers(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingCarriers(false);
            }
        }
        fetchCarriers();
    }, [])

    useEffect(() => {
        if (selPlanCarrier) {
            const getPlans = async () => {
                setLoadingPlans(true);
                try {
                    const result = await companyBasedPlans(selPlanCarrier);
                    setPlansData(result)
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingPlans(false);
                }
            }
            getPlans();
        }
    }, [selPlanCarrier])

    const getUserPlanOffers = async () => {
        setLoadingUserPlanOffers(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-user-offers/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.username })
                })
            const data = await res.json()
            setUserPlanOffers(data.offers)
            if (data.status === 'success') {
                message.success('Charges fetched successfully')
            } else {
                message.error(data.message || 'Failed to update charges')
            }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setLoadingUserPlanOffers(false) }
    }

    const togglePlanOffersOpen = () => {
        if (!planOffersOpen) {
            getUserPlanOffers();  // Fetch data when opening
        }
        setPlanOffersOpen(!planOffersOpen);
    };

    const getUserCarrierOffers = async () => {
        setLoadingUserCarrierOffers(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-company-offers/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.username })
                })
            const data = await res.json()
            setUserCarrierOffers(data.offers)
            if (data.status === 'success') {
                message.success('Charges fetched successfully')
            } else {
                message.error(data.message || 'Failed to update charges')
            }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setLoadingUserCarrierOffers(false) }
    }

    const toggleCarrierOffersOpen = () => {
        if (!carrierOffersOpen) {
            getUserCarrierOffers();  // Fetch data when opening
        }
        setCarrierOffersOpen(!carrierOffersOpen);
    };

    // --- Admin handlers ---
    useEffect(() => {
        // when admin selects a carrier for activation, fetch plans
        if (!adminActCarrier) return;
        const fetchPlans = async () => {
            try {
                const result = await companyBasedPlans(adminActCarrier);
                setAdminActPlans(result || []);
            } catch (err) {
                console.error('Failed to load admin plans', err);
            }
        };
        fetchPlans();
    }, [adminActCarrier]);

    // When admin selects carrier for activation, find carrier details for required fields
    useEffect(() => {
        if (!adminActCarrier) { setAdminActCarrierDetails(null); return }
        const c = carriers.find(x => x.company_id === adminActCarrier) || null;
        setAdminActCarrierDetails(c);
    }, [adminActCarrier, carriers]);

    // When admin selects carrier for topup, compute any company-specific discount
    useEffect(() => {
        if (!adminTopupCarrier) { setAdminTopupCompanyDiscount(0); setAdminTopupPayable(0); return }
        const compute = async () => {
            // ensure we have user's company offers loaded
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-company-offers/`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user.username })
                });
                const json = await res.json();
                const offers = json.offers || [];
                const myOffer = offers.find(o => String(o.company_id) === String(adminTopupCarrier));
                const compDisc = myOffer ? Number(myOffer.discount_percentage || 0) : 0;
                setAdminTopupCompanyDiscount(compDisc);
            } catch (err) { console.error('Failed to load company offers for admin topup', err); setAdminTopupCompanyDiscount(0) }
        };
        compute();
    }, [adminTopupCarrier, user]);

    // compute payable for admin topup when amount, discounts or companyDiscount change
    // NOTE: topups/recharges should not include 'charges' (tax) — only discounts apply
    useEffect(() => {
        const amt = Number(adminTopupAmount) || 0;
        const comp = Number(adminTopupCompanyDiscount) || 0; // company-level discount only
        // payable = amt * (1 - comp/100)
        const payable = amt * (1 - (comp / 100));
        setAdminTopupPayable(Number(payable?.toFixed(2)));
    }, [adminTopupAmount, adminTopupCompanyDiscount]);

    // compute payable for admin activation when plan, planDiscount (user) change
    // Use a single discount source to avoid double-counting (admin-set planDiscount overrides user offer)
    useEffect(() => {
        const planObj = adminActPlans.find(p => p.plan_id === adminActPlan) || null;
        const price = Number(planObj?.plan_price || 0);
        const pd = Number(planDiscount) || 0; // admin/user-set plan discount (may be an override)
        // find user specific plan offer
        const userPlanOffer = (userPlanOffers || []).find(o => String(o.plan_id) === String(adminActPlan));
        const uop = userPlanOffer ? Number(userPlanOffer.discount_percentage || 0) : 0;
        // prefer explicit planDiscount (admin override) if present, otherwise use user's plan offer
        const totalDiscount = pd > 0 ? pd : uop;
        const payable = price * (1 - (totalDiscount / 100));
        setAdminActPayable(Number(payable?.toFixed(2)));
    }, [adminActPlan, adminActPlans, planDiscount, userPlanOffers]);

    // When admin selects a plan, immediately fetch the user's plan offers and set the discount for that plan
    useEffect(() => {
        if (!adminActPlan) return;
        const fetchPlanOffer = async () => {
            setLoadingUserPlanOffers(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-user-offers/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.username })
                });
                const data = await res.json();
                const offers = data.offers || [];
                setUserPlanOffers(offers);

                const found = offers.find(o => String(o.plan_id) === String(adminActPlan));
                if (found) {
                    setPlanDiscount(Number(found.discount_percentage || 0));
                } else {
                    setPlanDiscount(0);
                }
            } catch (err) {
                console.error('Failed to fetch plan offers for admin activation', err);
            } finally {
                setLoadingUserPlanOffers(false);
            }
        };
        fetchPlanOffer();
    }, [adminActPlan, user]);

    // compute payable for admin fund (add funds) — includes charges and discount
    useEffect(() => {
        const amt = Number(adminFundAmount) || 0;
        // default fallbacks: charges 7%, discount 6% if backend values absent
        const charges = (typeof rechargeCharges !== 'undefined' && Number(rechargeCharges) >= 0) ? Number(rechargeCharges) : 7;
        const discount = (typeof rechargeDiscounts !== 'undefined' && Number(rechargeDiscounts) >= 0) ? Number(rechargeDiscounts) : 6;
        const payable = amt * (1 + charges / 100 - discount / 100);
        setAdminFundPayable(Number(payable?.toFixed(2)));
    }, [adminFundAmount, rechargeCharges, rechargeDiscounts]);

    // Cloudinary upload helper (reused from user addFunds flow)
    const handleCloudinaryUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "droptrixAccountsPayments");

        setAdminFundUploading(true);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/dyodgkvkr/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            setAdminFundUploading(false);
            return data.secure_url || null;
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            setAdminFundUploading(false);
            return null;
        }
    };

    const handleAdminFundFileChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const uploadedUrl = await handleCloudinaryUpload(file);
        if (uploadedUrl) setAdminFundScreenshot(uploadedUrl);
    };

    const submitAdminFund = async () => {
        const amount = Number(adminFundAmount);
        if (!amount || isNaN(amount) || amount <= 0) { message.error('Enter a valid amount'); return }
        setAdminFundSubmitting(true);
        try {
            const payload = {
                username: user.username,
                amount: amount,
                payment_screenshot: adminFundScreenshot,
                payable_amount: adminFundPayable,
                approved: true,
                status: 'Approved'
            };
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user-recharge-account/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'success') {
                message.success('Account fund added and approved');
                setAdminFundAmount(''); setAdminFundScreenshot('');
                loadData();
            } else { message.error(data.message || 'Failed to add fund') }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setAdminFundSubmitting(false) }
    }

    const submitAdminTopup = async () => {
        const amount = Number(adminTopupAmount);
        if (!adminTopupCarrier) { message.error('Select carrier'); return }
        if (!amount || isNaN(amount) || amount <= 0) { message.error('Enter valid amount'); return }
        if (!adminTopupPhone) { message.error('Enter phone number'); return }
        // check user's available balance
        const available = Number(userData?.available_balance || 0);
        if (available < adminTopupPayable) { message.error('Insufficient user balance for this top-up'); return }
        setAdminTopupSubmitting(true);
        try {
            const payload = {
                company_id: adminTopupCarrier,
                amount: amount,
                phone_no: adminTopupPhone,
                username: user.username,
                request_topup: false,
                status: 'Approved',
                payable_amount: adminTopupPayable
            };
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/add-topup/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.status !== 'error') {
                message.success('Top-up added & approved');
                setAdminTopupCarrier(null); setAdminTopupAmount(''); setAdminTopupPhone('');
                // update available balance if backend returned it
                if (data.account_balance !== undefined) {
                    setUserData(prev => ({ ...(prev || {}), available_balance: data.account_balance }));
                } else {
                    loadData();
                }
            } else { message.error(data.message || 'Failed to add topup') }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setAdminTopupSubmitting(false) }
    }

    const submitAdminActivation = async () => {
        if (!adminActCarrier) { message.error('Select carrier'); return }
        if (!adminActPlan) { message.error('Select plan'); return }
        if (!adminActSimNumber) { message.error('Enter SIM number'); return }
        // check available balance before activation
        const available = Number(userData?.available_balance || 0);
        if (available < adminActPayable) { message.error('Insufficient user balance for this activation'); return }
        // validation per carrier required fields
        const req = (adminActCarrierDetails && adminActSimType === 'E-Sim') ? (adminActCarrierDetails.esim_required_fields || []) : (adminActCarrierDetails && adminActSimType === 'Sim') ? (adminActCarrierDetails.physical_required_fields || []) : [];
        const isDigits = (s) => /^\d+$/.test(s || "");
        const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || "").trim());

        if (req.includes('phone_no') && !adminActSimNumber) { message.error('SIM number is required'); return }
        if (req.includes('iccid')) {
            if (!adminActIccid) { message.error('ICCID is required'); return }
            if (!isDigits(adminActIccid) || adminActIccid.length !== 32) { message.error('ICCID must be exactly 32 digits'); return }
        }
        if (adminActSimType === 'E-Sim') {
            if (req.includes('eid')) {
                if (!adminActEid) { message.error('EID is required'); return }
                if (!isDigits(adminActEid) || adminActEid.startsWith('0') || adminActEid.length > 10) { message.error('Invalid EID'); return }
            }
        }
        if (adminActSimType === 'Sim') {
            if (req.includes('emi')) {
                if (!adminActEmi) { message.error('EMI is required'); return }
                if (!isDigits(adminActEmi) || adminActEmi.length > 15) { message.error('Invalid EMI'); return }
            }
        }
        if (req.includes('postal_code')) {
            if (!adminActZip) { message.error('Postal/ZIP code is required'); return }
            if (!isDigits(adminActZip)) { message.error('ZIP code must be digits only'); return }
        }
        if (req.includes('email') && adminActEmail && !isValidEmail(adminActEmail)) { message.error('Enter a valid email'); return }

        setAdminActSubmitting(true);
        try {
            const selectedPlanObj = adminActPlans.find(p => p.plan_id === adminActPlan) || {};
            const payload = {
                username: user.username,
                sim_type: adminActSimType,
                plan_id: adminActPlan,
                company_id: adminActCarrier,
                phone_no: adminActSimNumber,
                amount_charged: adminActPayable,
                amount: Number(selectedPlanObj.plan_price || 0),
                emi: adminActEmi || '',
                eid: adminActEid || '',
                iccid: adminActIccid || '',
                email: adminActEmail || '',
                postal_code: adminActZip || 0,
                pin_code: adminActPin || 0,
                approved: true,
                status: 'Approved'
            };
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user-sim-activation/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'success') {
                message.success('SIM activated and approved');
                setAdminActCarrier(''); setAdminActPlan(''); setAdminActSimNumber(''); setAdminActEid(''); setAdminActIccid(''); setAdminActEmi(''); setAdminActEmail('');
                if (data.account_balance !== undefined) {
                    setUserData(prev => ({ ...(prev || {}), available_balance: data.account_balance }));
                } else {
                    loadData();
                }
            } else { message.error(data.message || 'Failed to activate SIM') }
        } catch (err) { console.error(err); message.error('Server error') }
        finally { setAdminActSubmitting(false) }
    }


    return (
        <div className="space-y-8">
            <h1 className="text-lg font-semibold">User Details</h1>

            <div className="relative bg-white border py-10 px-5 rounded-md shadow-md">
                <label className="absolute bg-white px-2 -top-3 font-semibold uppercase text-sm">
                    Personal Information
                </label>

                <div className='space-y-8'>

                    <div className="space-y-4 text-sm flex justify-between items-center">

                        <p className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">Name:</span>
                            {user?.full_name}
                        </p>

                        <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">Email:</span>
                            {user?.email}
                        </p>

                        <p className="flex items-center gap-2">
                            <BadgeCheck className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">Username:</span>
                            {user?.username}
                        </p>

                    </div>

                    <div className='grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 '>
                        <div className="flex justify-between w-full items-center bg-white border p-4 rounded-md shadow-md">
                            <div className='space-y-1'>
                                <div className="text-gray-600 text-sm">Balance</div>
                                <div className="text-xl font-semibold">
                                    {loadingUserData ? (
                                        <Loader className="w-5 h-5 animate-spin text-gray-600" />
                                    ) : (
                                        `${userData?.available_balance ?? 0} $`
                                    )}
                                </div>
                            </div>

                            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                                <Plus className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                        <div className="flex justify-between w-full items-center bg-white border p-4 rounded-md shadow-md">
                            <div className='space-y-1'>
                                <div className="text-gray-600 text-sm">Active Sims</div>
                                <div className="text-xl font-semibold">
                                    {loadingUserData ? (
                                        <Loader className="w-5 h-5 animate-spin text-gray-600" />
                                    ) : (
                                        `${userData?.active_sims_count ?? 0} `
                                    )}
                                </div>
                            </div>

                            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                                <Plus className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                        <div className="flex justify-between w-full items-center bg-white border p-4 rounded-md shadow-md">
                            <div className='space-y-1'>
                                <div className="text-gray-600 text-sm">Recharge Counts</div>
                                <div className="text-xl font-semibold">
                                    {loadingUserData ? (
                                        <Loader className="w-5 h-5 animate-spin text-gray-600" />
                                    ) : (
                                        userData?.transaction_history?.recharge_history?.length ?? 0
                                    )}
                                </div>
                            </div>

                            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                                <Plus className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Admin — Add on behalf of user: Account Fund */}
            <div className="relative bg-white border py-6 px-5 rounded-md shadow-md">
                <label className="absolute bg-white px-2 -top-3 font-semibold uppercase text-sm">Admin — Account Fund</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm">Amount ($)</label>
                        <input type="number" value={adminFundAmount} onChange={e => setAdminFundAmount(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1" />
                    </div>
                    <div>
                        <label className="text-sm">Payment Screenshot (optional)</label>
                        {adminFundScreenshot ? (
                            <div className="flex items-center gap-3 mt-2">
                                <img src={adminFundScreenshot} alt="screenshot" className="w-24 h-16 object-cover rounded-md border" />
                                <button onClick={() => setAdminFundScreenshot('')} className="text-sm text-red-600">Remove</button>
                            </div>
                        ) : (
                            <input type="file" accept="image/*" onChange={handleAdminFundFileChange} className="w-full border rounded-md px-3 py-2 mt-1 text-sm" />
                        )}
                        {adminFundUploading && <div className="text-sm text-blue-600 mt-2">Uploading...</div>}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <div className="text-sm text-gray-600">Charges: {rechargeCharges ?? 7}%</div>
                        <div className="text-sm text-gray-600">User Discount: {rechargeDiscounts ?? 6}%</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Payable Amount</div>
                        <div className="text-xl font-semibold">${adminFundPayable}</div>
                    </div>
                    <div className="text-right">
                        <button onClick={submitAdminFund} disabled={adminFundSubmitting || adminFundUploading} className={`mt-2 px-4 py-2 rounded-md text-white ${(adminFundSubmitting || adminFundUploading) ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {adminFundSubmitting ? 'Submitting...' : adminFundUploading ? 'Uploading...' : 'Add & Approve'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Admin — SIM Topup */}
            <div className="relative bg-white border py-6 px-5 rounded-md shadow-md">
                <label className="absolute bg-white px-2 -top-3 font-semibold uppercase text-sm">Admin — SIM Topup</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm">Select Carrier</label>
                        <select value={adminTopupCarrier || ''} onChange={e => setAdminTopupCarrier(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1">
                            <option value="">Select Carrier</option>
                            {carriers.map(c => (<option key={c.company_id} value={c.company_id}>{c.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm">Amount ($)</label>
                        <input type="number" value={adminTopupAmount} onChange={e => setAdminTopupAmount(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1" />
                    </div>
                    <div>
                        <label className="text-sm">Phone Number</label>
                        <input type="text" value={adminTopupPhone} onChange={e => setAdminTopupPhone(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1" />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <div className="text-sm text-gray-600">Company Discount: {adminTopupCompanyDiscount}%</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Payable Amount</div>
                        <div className="text-xl font-semibold">${adminTopupPayable}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">User Balance: ${userData?.available_balance ?? 0}</div>
                        <button onClick={submitAdminTopup} disabled={adminTopupSubmitting} className={`mt-2 px-4 py-2 rounded-md text-white ${adminTopupSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {adminTopupSubmitting ? 'Submitting...' : 'Add & Approve'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Admin — SIM Activation */}
            <div className="relative bg-white border py-6 px-5 rounded-md shadow-md">
                <label className="absolute bg-white px-2 -top-3 font-semibold uppercase text-sm">Admin — SIM Activation</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm">Select Carrier</label>
                        <select value={adminActCarrier || ''} onChange={e => setAdminActCarrier(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1">
                            <option value="">Select Carrier</option>
                            {carriers.map(c => (<option key={c.company_id} value={c.company_id}>{c.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm">Select Plan</label>
                        <select value={adminActPlan || ''} onChange={e => setAdminActPlan(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1">
                            <option value="">Select Plan</option>
                            {adminActPlans.map(p => (<option key={p.plan_id} value={p.plan_id}>{p.plan_name} - ${p.plan_price}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm">SIM Type</label>
                        <select value={adminActSimType} onChange={e => setAdminActSimType(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1">
                            <option value="Sim">Sim</option>
                            <option value="E-Sim">E-Sim</option>
                        </select>
                    </div>
                </div>

                {/* Additional activation fields that depend on carrier requirements */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/** derive required fields from selected carrier details */}
                    {(() => {
                        const req = (adminActCarrierDetails && adminActSimType === 'E-Sim') ? (adminActCarrierDetails.esim_required_fields || []) : (adminActCarrierDetails && adminActSimType === 'Sim') ? (adminActCarrierDetails.physical_required_fields || []) : [];
                        return (
                            <>
                                <div>
                                    <label className="text-sm">SIM Number {req.includes('phone_no') && <span className="text-xs text-gray-500">(required)</span>}</label>
                                    <input type="text" value={adminActSimNumber} onChange={e => setAdminActSimNumber(e.target.value)} className={`w-full border rounded-md px-3 py-2 mt-1 ${adminActCarrierDetails && !req.includes('phone_no') ? 'bg-gray-100 text-gray-500' : ''}`} disabled={adminActCarrierDetails && !req.includes('phone_no')} />
                                </div>

                                <div>
                                    <label className="text-sm">ICCID {req.includes('iccid') && <span className="text-xs text-gray-500">(required 32 digits)</span>}</label>
                                    <input type="text" value={adminActIccid} onChange={e => setAdminActIccid(e.target.value.replace(/\D/g, '').slice(0, 32))} className={`w-full border rounded-md px-3 py-2 mt-1 ${adminActCarrierDetails && !req.includes('iccid') ? 'bg-gray-100 text-gray-500' : ''}`} disabled={adminActCarrierDetails && !req.includes('iccid')} />
                                </div>

                                <div>
                                    <label className="text-sm">EID {req.includes('eid') && <span className="text-xs text-gray-500">(required)</span>}</label>
                                    <input type="text" value={adminActEid} onChange={e => setAdminActEid(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`w-full border rounded-md px-3 py-2 mt-1 ${adminActCarrierDetails && !req.includes('eid') ? 'bg-gray-100 text-gray-500' : ''}`} disabled={adminActCarrierDetails && !req.includes('eid')} />
                                </div>

                                <div>
                                    <label className="text-sm">EMI {req.includes('emi') && <span className="text-xs text-gray-500">(required)</span>}</label>
                                    <input type="text" value={adminActEmi} onChange={e => setAdminActEmi(e.target.value.replace(/\D/g, '').slice(0, 15))} className={`w-full border rounded-md px-3 py-2 mt-1 ${adminActCarrierDetails && !req.includes('emi') ? 'bg-gray-100 text-gray-500' : ''}`} disabled={adminActCarrierDetails && !req.includes('emi')} />
                                </div>

                                <div>
                                    <label className="text-sm">ZIP / Postal Code {req.includes('postal_code') && <span className="text-xs text-gray-500">(required)</span>}</label>
                                    <input type="text" value={adminActZip} onChange={e => setAdminActZip(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`w-full border rounded-md px-3 py-2 mt-1 ${adminActCarrierDetails && !req.includes('postal_code') ? 'bg-gray-100 text-gray-500' : ''}`} disabled={adminActCarrierDetails && !req.includes('postal_code')} />
                                </div>

                                <div>
                                    <label className="text-sm">PIN Code</label>
                                    <input type="text" value={adminActPin} onChange={e => setAdminActPin(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`w-full border rounded-md px-3 py-2 mt-1 ${adminActCarrierDetails && !req.includes('pinCode') ? 'bg-gray-100 text-gray-500' : ''}`} disabled={adminActCarrierDetails && !req.includes('pinCode')} />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="text-sm">Email {req.includes('email') && <span className="text-xs text-gray-500">(required)</span>}</label>
                                    <input type="email" value={adminActEmail} onChange={e => setAdminActEmail(e.target.value)} className={`w-full border rounded-md px-3 py-2 mt-1 ${adminActCarrierDetails && !req.includes('email') ? 'bg-gray-100 text-gray-500' : ''}`} disabled={adminActCarrierDetails && !req.includes('email')} />
                                </div>
                            </>
                        )
                    })()}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <div className="text-sm text-gray-600">Plan Price: ${(() => { const p = adminActPlans.find(pp => pp.plan_id === adminActPlan); return p ? p.plan_price : 0 })()}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Payable Amount</div>
                        <div className="text-xl font-semibold">${adminActPayable}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">User Balance: ${userData?.available_balance ?? 0}</div>
                        <button onClick={submitAdminActivation} disabled={adminActSubmitting} className={`mt-2 px-4 py-2 rounded-md text-white ${adminActSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {adminActSubmitting ? 'Submitting...' : 'Activate & Approve'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative bg-white border py-10 px-5 rounded-md shadow-md">
                <label className="absolute bg-white px-2 -top-3 font-semibold uppercase text-sm">
                    Charges Information ( %)
                </label>

                <div className='flex gap-3'>
                    <div className='grid md:grid-cols-2 gap-4 w-11/12'>
                        <div className='space-y-3'>
                            <div>
                                <label className='text-sm font-semibold'>Recharge Tax (%)</label>
                                <input type="number"
                                    value={rechargeCharges}
                                    onChange={e => {
                                        setRechargeCharges(e.target.value)
                                        setIsReChange(true)
                                    }}
                                    placeholder='e.g. 1.0'
                                    disabled={saving || loadingChargesData || loadingUserData}
                                    className='w-full border rounded-md px-3 py-2'
                                />
                            </div>
                        </div>
                        <div className='md:max-w-2xl gap-4'>
                            <div>
                                <label className='text-sm font-semibold'>Recharge Discount (%)</label>
                                <input type="number"
                                    value={rechargeDiscounts}
                                    onChange={e => {
                                        setRechargeDiscounts(e.target.value)
                                        setIsReChange(true)
                                    }}
                                    placeholder='e.g. 5'
                                    disabled={saving || loadingChargesData || loadingUserData}
                                    className='w-full border rounded-md px-3 py-2'
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveCharges}
                        disabled={saving || !isReChange || loadingChargesData}
                        className={`${(saving || !isReChange || loadingChargesData) ? 'opacity-50 bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700  '}  h-fit w-1/12 self-end px-2 py-2.5 rounded-md text-white`}
                    >
                        {(saving || loadingChargesData) ? <Loader className="w-4 h-4 animate-spin inline-block mr-1" /> : null}
                        Save
                    </button>
                </div>
            </div>


            <div className="relative bg-white border py-10 px-5 rounded-md shadow-md">
                <label className="absolute bg-white px-2 -top-3 font-semibold uppercase text-sm">
                    Topup Offers ( %)
                </label>

                <div className='flex gap-3'>
                    <div className='grid md:grid-cols-2 gap-4 w-11/12'>
                        <div className='space-y-3'>
                            <div>
                                <label className='text-sm font-semibold'>Select Carrier</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={selectedCarrier}
                                    onChange={(e) => {
                                        setSelectedCarrier(e.target.value);
                                        setIsTopUpChange(true);
                                    }}
                                    disabled={loadingCarriers || saving}
                                >
                                    <option value="no" className="text-gray-500">Select Carrier</option>

                                    {carriers.map((carrier) => (
                                        <option key={carrier.company_id} value={carrier.company_id}>
                                            {carrier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='md:max-w-2xl gap-4'>
                            <div>
                                <label className='text-sm font-semibold'>Discount (%)</label>
                                <input
                                    type="number"
                                    value={carrierDiscounts}
                                    onChange={e => {
                                        setCarrierDiscounts(e.target.value)
                                        setIsTopUpChange(true)
                                    }}
                                    placeholder='e.g. 5'
                                    disabled={loadingCarriers || saving}
                                    className='w-full border rounded-md px-3 py-2' />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveCarrierDiscount}
                        disabled={!isTopUpChange || loadingCarriers || saving}
                        className={`${(!isTopUpChange || loadingCarriers || saving) ? 'opacity-50 bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700  '}  h-fit w-1/12 self-end px-2 py-2.5 rounded-md text-white`}
                    >
                        {(saving) ? <Loader className="w-4 h-4 animate-spin inline-block mr-1" /> : null}
                        Save
                    </button>
                </div>
                <div className="border rounded-lg bg-white shadow-sm mt-4">
                    {/* Header Row */}
                    <div
                        className="flex justify-between items-center px-4 py-3 cursor-pointer select-none bg-gray-100"
                        onClick={toggleCarrierOffersOpen}
                    >
                        <span className="font-medium text-gray-700">All Records</span>

                        {carrierOffersOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </div>

                    {/* Expandable Content */}
                    {carrierOffersOpen && (
                        <div className="px-4">
                            <table className="w-full text-sm border rounded-md overflow-hidden">
                                <thead>
                                    <tr>
                                        <th className="p-2 border">#</th>
                                        <th className="p-2 border">Carrier</th>
                                        <th className="p-2 border">Discount (%)</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loadingUserCarrierOffers ? (
                                        <tr>
                                            <td className="p-6 text-center border" colSpan="3">
                                                <Loader className="w-6 h-6 animate-spin mx-auto text-gray-600" />
                                            </td>
                                        </tr>
                                    ) : userCarrierOffers?.length > 0 ? (
                                        userCarrierOffers.map((offer, index) => (
                                            <tr key={offer.id} className="hover:bg-gray-50">
                                                <td className="p-2 border text-center">{index + 1}</td>
                                                <td className="p-2 border">{offer.company_name}</td>
                                                <td className="p-2 border text-center">{offer.discount_percentage}%</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="p-3 text-center text-gray-500 border" colSpan="3">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative bg-white border py-10 px-5 rounded-md shadow-md">
                <label className="absolute bg-white px-2 -top-3 font-semibold uppercase text-sm">
                    Plan Activation Offers ( %)
                </label>

                <div className='flex gap-3'>
                    <div className='grid md:grid-cols-3 gap-4 w-11/12'>
                        <div className='space-y-3'>
                            <div>
                                <label className='text-sm font-semibold'>Select Carrier</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={selPlanCarrier}
                                    onChange={(e) => {
                                        setSelPlanCarrier(e.target.value);
                                        setIsPlanChange(true);
                                    }}
                                    disabled={loadingCarriers || saving}
                                >
                                    <option value="no" className="text-gray-500">Select Carrier</option>

                                    {carriers.map((carrier) => (
                                        <option key={carrier.company_id} value={carrier.company_id}>
                                            {carrier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='space-y-3'>
                            <div>
                                <label className='text-sm font-semibold'>Select Plan</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={selectedPlan}
                                    onChange={(e) => {
                                        setSelectedPlan(e.target.value);
                                        setIsPlanChange(true);
                                    }}
                                    disabled={loadingPlans || saving}
                                >
                                    <option value="no" className="text-gray-500">Select Plan</option>

                                    {plansData.map((plan) => (
                                        <option key={plan.plan_id} value={plan.plan_id}>
                                            {plan.plan_name} - {plan.plan_price} $
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='space-y-3'>
                            <div>
                                <label className='text-sm font-semibold'>Discount (%)</label>
                                <input
                                    type="number"
                                    value={planDiscount}
                                    onChange={e => {
                                        setPlanDiscount(e.target.value)
                                        setIsPlanChange(true)
                                    }}
                                    placeholder='e.g. 5'
                                    disabled={loadingPlans || saving}
                                    className='w-full border rounded-md px-3 py-2' />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSavePlanDiscount}
                        disabled={!isPlanChange || loadingPlans || saving}
                        className={`${(!isPlanChange || loadingPlans || saving) ? 'opacity-50 bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700  '}  h-fit w-1/12 self-end px-2 py-2.5 rounded-md text-white`}
                    >
                        {(saving) ? <Loader className="w-4 h-4 animate-spin inline-block mr-1" /> : null}
                        Save
                    </button>
                </div>

                <div className="border rounded-lg bg-white shadow-sm mt-4">
                    {/* Header Row */}
                    <div
                        className="flex justify-between items-center px-4 py-3 cursor-pointer select-none bg-gray-100"
                        onClick={togglePlanOffersOpen}
                    >
                        <span className="font-medium text-gray-700">All Records</span>

                        {planOffersOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </div>

                    {/* Expandable Content */}
                    {planOffersOpen && (
                        <div className="px-4">
                            <table className="w-full text-sm border rounded-md overflow-hidden">
                                <thead>
                                    <tr>
                                        <th className="p-2 border">#</th>
                                        <th className="p-2 border">Name</th>
                                        <th className="p-2 border">Discount (%)</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loadingUserPlanOffers ? (
                                        <tr>
                                            <td className="p-6 text-center border" colSpan="3">
                                                <Loader className="w-6 h-6 animate-spin mx-auto text-gray-600" />
                                            </td>
                                        </tr>
                                    ) : userPlanOffers?.length > 0 ? (
                                        userPlanOffers.map((offer, index) => (
                                            <tr key={offer.id} className="hover:bg-gray-50">
                                                <td className="p-2 border text-center">{index + 1}</td>
                                                <td className="p-2 border">{offer.plan_name}</td>
                                                <td className="p-2 border text-center">{offer.discount_percentage}%</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="p-3 text-center text-gray-500 border" colSpan="3">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>


        </div>


    )
}

export default UserDetails
