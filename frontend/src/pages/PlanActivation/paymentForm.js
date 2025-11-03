import React, { useState } from "react";

const PaymentForm = () => {
    const [formData, setFormData] = useState({
        zipCode: "",
        eid: "",
        email: "",
        contact: "",
        planType: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.zipCode) newErrors.zipCode = "Zip code is required";
        if (!formData.eid) newErrors.eid = "EID is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Enter a valid email";
        if (!formData.contact) newErrors.contact = "Contact number is required";
        if (!formData.planType) newErrors.planType = "Please select a plan type";
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        alert("Form submitted successfully ✅");
    };

    return (
        <div className="pb-20 bg-gradient-to-b from-blue-100 to-white min-h-screen">
            <div className="text-center mb-12 pt-14 pb-6">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
                    Activate Your Plan
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Connect with trusted international SIM providers and explore affordable
                    global plans to stay online anywhere in the world.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex justify-center items-center"
            >
                <div className="w-full max-w-3xl space-y-8">
                    {/* SIM DETAILS */}
                    <div className="bg-white shadow-md rounded-xl border border-blue-200">
                        <div className="bg-blue-600 text-center py-2 text-white rounded-t-xl font-semibold">
                            SIM Details
                        </div>
                        <div className="px-8 pt-4 pb-6">
                            <div className="mb-6">
                                <label className="block font-medium text-gray-700">
                                    Activate Zip Code
                                </label>
                                <input
                                    type="number"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className={`w-full border rounded-md px-3 py-1.5 mt-2 ${errors.zipCode ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Enter your zip code"
                                />
                                {errors.zipCode && (
                                    <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                                )}
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700">EID</label>
                                <input
                                    type="number"
                                    name="eid"
                                    value={formData.eid}
                                    onChange={handleChange}
                                    className={`w-full border rounded-md px-3 py-1.5 mt-2 ${errors.eid ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Enter your EID number"
                                />
                                {errors.eid && (
                                    <p className="text-red-500 text-sm mt-1">{errors.eid}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CONTACT DETAILS */}
                    <div className="bg-white shadow-md rounded-xl border border-blue-200">
                        <div className="bg-blue-600 text-center py-2 text-white rounded-t-xl font-semibold">
                            Contact Details
                        </div>
                        <div className="px-8 pt-4 pb-6">
                            <div className="mb-6">
                                <label className="block font-medium text-gray-700">Email</label>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full border rounded-md px-3 py-1.5 mt-2 ${errors.email ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700">
                                    Contact No
                                </label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    className={`w-full border rounded-md px-3 py-1.5 mt-2 ${errors.contact ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Enter your WhatsApp number"
                                />
                                {errors.contact && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PLAN DETAILS */}
                    <div className="bg-white shadow-md rounded-xl border border-blue-200">
                        <div className="bg-blue-600 text-center py-2 text-white rounded-t-xl font-semibold">
                            Plan Details
                        </div>
                        <div className="px-8 pt-4 pb-6 space-y-6">
                            <div className="flex items-center gap-x-8">
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
                            {errors.planType && (
                                <p className="text-red-500 text-sm -mt-4">{errors.planType}</p>
                            )}

                            <hr />
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-semibold text-gray-700 text-lg">
                                        Premium Plan / 30 Days
                                    </h2>
                                    <button
                                        type="button"
                                        className="text-blue-600 underline text-sm hover:text-blue-800"
                                    >
                                        View details
                                    </button>
                                </div>
                                <p className="font-medium text-lg text-gray-700">$400</p>
                            </div>
                        </div>
                    </div>

                    {/* TOTAL */}
                    <div className="bg-white shadow-md rounded-xl p-6 border border-blue-200">
                        <div className="flex justify-between mb-2">
                            <p className="font-medium text-gray-700">Other Charges</p>
                            <p className="font-medium text-gray-700">$20</p>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between mb-4">
                            <p className="font-semibold text-gray-800">Total</p>
                            <p className="font-semibold text-gray-800">$420</p>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg w-full text-center font-semibold transition"
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;
