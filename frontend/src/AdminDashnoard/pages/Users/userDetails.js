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

    const loadData = async () => {
        setLoadingUserData(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/user-dashboard-summary/`, {
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
                `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-charges-discount/`,
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
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/update-charges-discount/`,
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
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/add-company-offer/`,
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
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/add-user-offer/`,
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
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-offers/`,
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
            const res = await fetch(`${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-company-offers/`,
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
