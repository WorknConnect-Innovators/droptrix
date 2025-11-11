import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlansCards from "../../components/Plans/plansCards";

function PlansPage() {
    const { choosenPlanType } = useParams();
    const [selected, setSelected] = useState("All");
    const [plans, setPlans] = useState([]);

    const companies = ["AT & T", "Lyca Mobile", "Linkup Mobile", "All", "T-Mobile", "Mobile X", "Trum Mobile"];

    const rawPlansData = [
        {
            capsuleHeader: "Most Popular",
            title: "Advanced Plan",
            discountPercentage: 25,
            price: "$299",
            offPrice: "$399",
            company: "Company A",
            duration: "12 Months",
            features: [
                {
                    text: "Custom reports and analytics",
                    info: "Get detailed insights with our advanced reporting tools.",
                },
                { text: "Hello feature", info: "Invalid empty feature" },
                { text: "Check feature", info: "" },
            ],
        },
        {
            capsuleHeader: "",
            title: "Pro Plan",
            discountPercentage: 20,
            price: "$199",
            offPrice: "$249",
            company: "Company B",
            duration: "24 Months",
            features: [
                { text: "Priority 24/7 Support", info: "Direct line to technical team" },
                { text: "Up to 50 inventory locations", info: "" },
            ],
        },
        {
            capsuleHeader: "",
            title: "Basic Plan",
            discountPercentage: null,
            price: "$99",
            offPrice: "",
            company: "Company C",
            duration: "1 Month",
            features: [
                { text: "Standard support", info: "" },
                { text: "", info: "" }, // remove
            ],
        },
    ];

    useEffect(() => {
        // Clean data and filter based on company
        const cleanedData = rawPlansData
            .map((plan) => {
                const validFeatures = Array.isArray(plan.features)
                    ? plan.features.filter((f) => f.text?.trim() !== "")
                    : [];

                return {
                    ...plan,
                    features: validFeatures,
                };
            })
            .filter((plan) =>
                selected === "All" ? true : plan.company === selected
            );

        setPlans(cleanedData);
    }, [selected]);

    return (
        <div>
            {/* HEADER */}
            <div className="bg-gradient-to-b from-blue-100 to-white pt-14 pb-6 w-full flex flex-col justify-center items-center text-center">
                <h1 className="text-4xl font-bold text-blue-900 mb-2">
                    {choosenPlanType}
                </h1>
                <p className="text-lg text-gray-700 max-w-4xl">
                    {choosenPlanType} is one of the leading international SIM providers,
                    offering the best connectivity, coverage, and exclusive deals across
                    multiple countries. We’ve partnered with {choosenPlanType} to bring
                    you their most reliable plans and unbeatable offers—all in one place.
                </p>
            </div>

            <h2 className="text-center text-2xl text-blue-900 font-semibold mt-6">
                Choose the best {choosenPlanType} plan
            </h2>

            {/* COMPANY SELECTOR */}
            <div className="flex justify-center items-center my-6">
                <ul className="bg-gray-50 border rounded-full shadow-inner w-fit p-1 flex gap-x-4">
                    {companies.map((company) => (
                        <li
                            key={company}
                            onClick={() => setSelected(company)}
                            className={`cursor-pointer text-sm md:text-base font-medium px-6 py-2 rounded-full transition-all duration-200 
                ${selected === company
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-700 hover:bg-blue-100"
                                }`}
                        >
                            {company}
                        </li>
                    ))}
                </ul>
            </div>

            {/* ✅ Render Filtered Plans */}
            <div className="pb-20">
                {plans.length > 0 ? (
                    <PlansCards PlansData={plans} />
                ) : (
                    <div className="text-center text-gray-500 mt-10">
                        No plans available for {selected}.
                    </div>
                )}
            </div>

            <div className="bg-blue-50 w-full p-10 text-center text-gray-600">
                <p>
                    Know more about {choosenPlanType} plans. <span>Chat with us!</span>
                </p>
            </div>
        </div>
    );
}

export default PlansPage;
