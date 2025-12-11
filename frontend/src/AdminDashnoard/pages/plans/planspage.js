import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, DeleteIcon } from "lucide-react";
import { getIDBasedPlans } from "../../../utilities/getPlans";

function AdminPlansPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [plans, setPlans] = useState([]);
    const [carriers, setCarriers] = useState([]);
    const [isEditing, setisEditing] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [newPlan, setNewPlan] = useState({
        company_id: "",
        plan_name: "",
        plan_type: "",
        plan_price: "",
        previous_price: "",
        plan_duration: "",
        plan_feature: [""],
        off_percentage: "",
        tagline1: "",
        tagline2: "",
        details: "",
    });

    const handleEditingToggle = async (planID) => {
        // open the shared form in edit mode
        setisEditing(true);
        setIsAddingPlan(true);
        setEditingPlanId(planID);
        const plans = await getIDBasedPlans(planID);
        setNewPlan({
            company_id: plans.company_id,
            plan_name: plans.plan_name,
            plan_type: plans.plan_type,
            plan_price: plans.plan_price,
            previous_price: plans.previous_price,
            plan_duration: plans.plan_duration,
            plan_feature: plans.plan_feature || [""],
            off_percentage: plans.off_percentage,
            tagline1: plans.tagline1,
            tagline2: plans.tagline2,
            details: plans.details,
        });
    }

    const duration = ["1 Month", "3 Months", "6 Months", "12 Months"];
    const planTypes = ["Prepaid", "Postpaid", "Company"];

    const getCarriersFromBackend = async () => {
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/get-carriers/`
            );
            const data = await res.json();

            if (data.status === "success") {
                setCarriers(data?.data);
            } else {
                console.error("Invalid data structure:", data);
                setCarriers([]);
            }
        } catch (error) {
            console.error("Error fetching carriers:", error);
            setCarriers([]);
        }
    };

    useEffect(() => {
        getCarriersFromBackend();
    }, [])

    // ✅ Fetch Plans from Backend
    const getPlansFromBackend = async () => {
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/get-plans/`
            );
            const data = await res.json();

            if (data.status === "success") {
                const LivePlans = data.data.filter(plan => plan.live_status === true);
                setPlans(LivePlans);
            } else {
                setPlans([]);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            setPlans([]); // fallback in case of error
        }
    };

    useEffect(() => {
        getPlansFromBackend();
    }, []);


    // ✅ Add Plan Function
    const handleAddPlan = async () => {
        const {
            company_id,
            plan_name,
            plan_type,
            plan_price,
            previous_price,
            plan_duration,
            plan_feature,
            off_percentage,
            tagline1,
            tagline2,
            details,
        } = newPlan;

        if (!company_id || !plan_name || !plan_duration) {
            alert("Please fill required fields before adding a plan.");
            return;
        }
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/add-plans/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        company_id,
                        popularity: 'High',
                        plan_name,
                        plan_type,
                        plan_price,
                        previous_price,
                        plan_duration,
                        plan_feature,
                        off_percentage,
                        tagline1,
                        tagline2,
                        details,
                        live_status: true,
                    }),
                }
            );

            const result = await res.json();

            if (result.status === "success") {
                setPlans((prev) => [...prev, { ...newPlan, id: prev.length + 1 }]);
                setIsAddingPlan(false);
                setNewPlan({
                    company_id: "",
                    plan_name: "",
                    plan_type: "",
                    plan_price: "",
                    previous_price: "",
                    plan_duration: "",
                    plan_feature: [""],
                    off_percentage: "",
                    tagline1: "",
                    tagline2: "",
                    details: "",
                });
            } else {
                alert("Failed to add plan: " + result.message);
            }
        } catch (err) {
            console.error("Backend error:", err);
        }
    };

    // Update existing plan
    const handleUpdatePlan = async () => {
        if (!editingPlanId) return;

        const {
            company_id,
            plan_name,
            plan_type,
            plan_price,
            previous_price,
            plan_duration,
            plan_feature,
            off_percentage,
            tagline1,
            tagline2,
            details,
        } = newPlan;

        if (!company_id || !plan_name || !plan_duration) {
            alert("Please fill required fields before updating the plan.");
            return;
        }

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/update-plans/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        company_id,
                        plan_name,
                        plan_type,
                        popularity: 'High',
                        live_status: true,
                        plan_price,
                        previous_price,
                        plan_duration,
                        plan_feature,
                        off_percentage,
                        tagline1,
                        tagline2,
                        details,
                        plan_id: editingPlanId,
                    }),
                }
            );

            const result = await res.json();
            if (result.status === "success") {
                setPlans((prev) =>
                    prev.map((p) =>
                        p.plan_id === editingPlanId || p.id === editingPlanId ? { ...p, ...newPlan } : p
                    )
                );
                setIsAddingPlan(false);
                setisEditing(false);
                setEditingPlanId(null);
                setNewPlan({
                    company_id: "",
                    plan_name: "",
                    plan_type: "",
                    plan_price: "",
                    previous_price: "",
                    plan_duration: "",
                    plan_feature: [""],
                    off_percentage: "",
                    tagline1: "",
                    tagline2: "",
                    details: "",
                });
            } else {
                alert("Failed to update plan: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Update failed. See console for details.");
        }
    };


    // ✅ Delete Plan (frontend only)
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this plan?")) {
            setPlans((prev) => prev.filter((c) => c.id !== id));
        }
    };

    const filteredPlans = Array.isArray(plans)
        ? plans.filter((c) =>
            c.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : []

    const handleCancel = () => {
        setisEditing(false);
        setIsAddingPlan(false);
        setNewPlan({
            company_id: "",
            plan_name: "",
            plan_type: "",
            plan_price: "",
            previous_price: "",
            plan_duration: "",
            plan_feature: [""],
            off_percentage: "",
            tagline1: "",
            tagline2: "",
            details: "",
        });
        setEditingPlanId(null);
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    {isAddingPlan ? "Add New Plan" : "Manage Plans"}
                </h1>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search plan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {!isAddingPlan ? (
                        <button
                            onClick={() => setIsAddingPlan(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={18} /> Add Plan
                        </button>
                    ) : (
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <DeleteIcon size={18} /> Cancel
                        </button>
                    )}

                </div>
            </div>

            {/* Table */}
            {isAddingPlan || isEditing ? (
                <div className="w-full">
                    <div className="border rounded-md shadow p-6 bg-white">
                        <div className="grid grid-cols-6 gap-6">

                            {/* Choose Carrier */}
                            <div className="col-span-5">
                                <label className="block text-sm font-medium mb-1">Choose Carrier</label>
                                <select
                                    value={newPlan.company_id}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, company_id: e.target.value }))
                                    }
                                    disabled={isEditing}
                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500${isEditing ? " bg-gray-100 cursor-not-allowed" : ""}`}
                                >
                                    <option value="">Select Carrier</option>
                                    {Array.isArray(carriers) && carriers.length > 0 ? (
                                        carriers.map((carrier) => (
                                            <option key={carrier.company_id} value={carrier.company_id}>
                                                {carrier.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No carriers available</option>
                                    )}
                                </select>
                            </div>

                            {/* Plan Name */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    value={newPlan.plan_name}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, plan_name: e.target.value }))
                                    }
                                    disabled={isEditing}
                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500${isEditing ? " bg-gray-100 cursor-not-allowed" : ""}`}
                                    placeholder="Enter plan name"
                                />
                            </div>

                            {/* Duration */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Duration</label>
                                <select
                                    value={newPlan.plan_duration}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, plan_duration: e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Duration</option>
                                    {duration.map((dur, index) => (
                                        <option key={index} value={dur}>
                                            {dur}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Plan Type */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Plan Type</label>
                                <select
                                    value={newPlan.plan_type}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, plan_type: e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Plan Type</option>
                                    {planTypes.map((type, index) => (
                                        <option selected={newPlan.plan_type === type} key={index} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Current Price */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Current Price</label>
                                <input
                                    type="text"
                                    value={newPlan.plan_price}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, plan_price: e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter current price"
                                />
                            </div>

                            {/* Previous Price */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Previous Price</label>
                                <input
                                    type="text"
                                    value={newPlan.previous_price}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, previous_price: e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter previous price"
                                />
                            </div>

                            {/* Discount */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Discount</label>
                                <input
                                    type="text"
                                    value={newPlan.off_percentage}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, off_percentage: e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter discount"
                                />
                            </div>

                            {/* Tagline 1 */}
                            <div className="col-span-3">
                                <label className="block text-sm font-medium mb-1">Tagline 1</label>
                                <input
                                    type="text"
                                    value={newPlan.tagline1}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, tagline1: e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter tagline 1"
                                />
                            </div>

                            {/* Tagline 2 */}
                            <div className="col-span-3">
                                <label className="block text-sm font-medium mb-1">Tagline 2</label>
                                <input
                                    type="text"
                                    value={newPlan.tagline2}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, tagline2: e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter tagline 2"
                                />
                            </div>

                            {/* ✅ Dynamic Check Points */}
                            <div className="col-span-6">
                                <label className="block text-sm font-medium mb-1">Check Points</label>
                                {newPlan.plan_feature.map((point, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={point}
                                            onChange={(e) => {
                                                const updated = [...newPlan.plan_feature];
                                                updated[index] = e.target.value;
                                                setNewPlan((prev) => ({ ...prev, plan_feature: updated }));
                                            }}
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Checkpoint ${index + 1}`}
                                        />
                                        <button
                                            onClick={() => {
                                                const updated = newPlan.plan_feature.filter((_, i) => i !== index);
                                                setNewPlan((prev) => ({ ...prev, plan_feature: updated }));
                                            }}
                                            className="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() =>
                                        setNewPlan((prev) => ({
                                            ...prev,
                                            plan_feature: [...prev.plan_feature, ""],
                                        }))
                                    }
                                    className="mt-2 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                                >
                                    + Add Checkpoint
                                </button>
                            </div>

                            {/* Details */}
                            <div className="col-span-6">
                                <label className="block text-sm font-medium mb-1">Details</label>
                                <textarea
                                    value={newPlan.details}
                                    onChange={(e) =>
                                        setNewPlan((prev) => ({ ...prev, details: e.target.value }))
                                    }
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter plan details"
                                ></textarea>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            {isEditing ? (
                                <button
                                    onClick={handleUpdatePlan}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                >
                                    Update Plan
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddPlan}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                >
                                    Add Plan
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-blue-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 text-left">Plan Name</th>
                                <th className="px-6 py-3 text-left">Price</th>
                                <th className="px-6 py-3 text-left">Description</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlans.length > 0 ? (
                                filteredPlans.map((plan, index) => (
                                    <tr
                                        key={index}
                                        className="border-t hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-3 font-medium">{plan.plan_name}</td>
                                        <td className="px-6 py-3">{plan.plan_price}</td>
                                        <td className="px-6 py-3">{plan.details}</td>
                                        <td className="px-6 py-3 flex justify-center gap-3">
                                            <button onClick={() => handleEditingToggle(plan.plan_id)} className="text-blue-600 hover:text-blue-800">
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-6 text-center text-gray-500 italic"
                                    >
                                        No plans found.
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

export default AdminPlansPage;
