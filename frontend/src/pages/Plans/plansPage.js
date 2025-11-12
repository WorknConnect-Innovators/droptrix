import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import PlansCards from "../../components/Plans/plansCards";
import { getPlansFromBackend } from "../../utilities/getPlans";
import { getCarriersFromBackend } from "../../utilities/getCarriers";

function PlansPage() {
    const { choosenPlanType } = useParams();
    const [selected, setSelected] = useState("All");
    const [plans, setPlans] = useState([]);
    const [companies, setCompanies] = useState([]);

    // ✅ Fetch plans and carriers once
    useEffect(() => {
        const fetchData = async () => {
            const carriersData = await getCarriersFromBackend();
            const plansData = await getPlansFromBackend();

            setCompanies(carriersData);
            setPlans(plansData);
            setSelected("All"); // Default
        };

        fetchData();
    }, []);

    // ✅ Filter logic (memoized to prevent re-renders)
    const filteredPlans = useMemo(() => {
        if (selected === "All") {
            return plans;
        }

        const selectedCompany = companies.find((c) => c.name === selected);
        if (!selectedCompany) return [];

        return plans.filter(
            (plan) => plan.company_id === selectedCompany.company_id
        );
    }, [selected, plans, companies]);

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
                <ul className="bg-gray-50 border rounded-full shadow-inner w-fit p-1 flex gap-x-4 overflow-x-auto">
                    {["All", ...companies.map((c) => c.name)].map((company) => (
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

            {/* ✅ Filtered Plans */}
            <div className="pb-20">
                {filteredPlans.length > 0 ? (
                    <PlansCards PlansData={filteredPlans} />
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
