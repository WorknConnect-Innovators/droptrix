import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import PlansCards from "../../components/Plans/plansCards";
import { getPlansFromBackend } from "../../utilities/getPlans";
import { getCarriersFromBackend } from "../../utilities/getCarriers";
import Loader from "../../layout/loader";
import PlansPageSkeleton from "../Skeletons/plansPage";

function PlansPage() {
    const { choosenPlanType } = useParams();
    const [selected, setSelected] = useState("All");
    const [plans, setPlans] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const planDescriptions = {
        Prepaid: `
    Prepaid plans give you complete control over your spending with no contracts
    or long-term commitments. Enjoy flexible data, calls, and SMS bundles that
    you can recharge anytime—perfect for travelers and short-term usage.
  `,

        Postpaid: `
    Postpaid plans offer seamless connectivity with monthly billing and premium
    benefits. Get higher data limits, priority network access, and uninterrupted
    service—ideal for users who want hassle-free, long-term connectivity.
  `,

        Company: `
    Company plans are designed for businesses that need reliable and scalable
    communication solutions. Manage multiple SIMs, control usage, and ensure
    consistent connectivity for your teams across multiple regions.
  `,
    };

    // ✅ Fetch plans and carriers once
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            const carriersData = await getCarriersFromBackend();
            const plansData = await getPlansFromBackend();

            setCompanies(carriersData);
            setPlans(plansData);
            setSelected("All");
            setLoading(false);
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
            <div className="px-4 bg-gradient-to-b from-blue-100 to-white pt-14 pb-6 w-full flex flex-col justify-center items-center text-center">
                <h1 className="text-4xl font-bold text-blue-900 mb-2">
                    {choosenPlanType}
                </h1>
                <p className="text-lg text-gray-700 max-w-4xl">
                    {planDescriptions[choosenPlanType]}
                </p>
            </div>

            <h2 className="text-center px-4 sm:text-2xl text-xl text-blue-900 font-semibold mt-6">
                Choose the best {choosenPlanType} plan
            </h2>

            {loading ? (
                <PlansPageSkeleton />
            ) : (
                <>
                    <div className="flex justify-center items-center my-6 px-4">
                        <ul className="bg-gray-50 border rounded-full shadow-inner w-fit p-1 flex md:gap-x-4 sm:gap-x-2 overflow-x-auto">
                            {["All", ...companies.map((c) => c.name)].map((company) => (
                                <li
                                    key={company}
                                    onClick={() => setSelected(company)}
                                    className={`whitespace-nowrap cursor-pointer text-sm md:text-base font-medium px-6 py-2 rounded-full transition-all duration-200 
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
                    <div className="pb-20">
                        {filteredPlans.length > 0 ? (
                            <PlansCards PlansData={filteredPlans} />
                        ) : (
                            <div className="text-center text-gray-500 mt-10">
                                No plans available for {selected}.
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="bg-blue-50 w-full p-10 px-4 text-center text-gray-600">
                <p>
                    Know more about {choosenPlanType} plans. <span>Chat with us!</span>
                </p>
            </div>
        </div>
    );
}

export default PlansPage;
