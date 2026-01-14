import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import PlansCards from "../../components/Plans/plansCards";
import { getPlansFromBackend } from "../../utilities/getPlans";
import { SkeletonBlock } from "../Skeletons/skeletonBloack";

function CompanyPage() {
  const location = useLocation();
  const clickedButton = location.state?.clickedButton || "None";
  const selectedCarrier = location.state?.selectedCarrier || null;
  const [loading, setLoading] = useState(false);
  const { companyName } = useParams();

  const [selected, setSelected] = useState("prepaid");
  const [plans, setPlans] = useState([]);

  // Fetch all plans once
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const plansData = await getPlansFromBackend();
      setPlans(plansData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Plan type selector mapping
  const planTypeArr = [
    { label: "Prepaid Plans", value: "prepaid" },
    { label: "Postpaid Plans", value: "postpaid" },
    { label: "Company Plans", value: "company" },
  ];

  // Clean + filter plans
  const filteredPlans = useMemo(() => {
    const cleanedPlans = plans.map((plan) => {
      const validFeatures = Array.isArray(plan.features)
        ? plan.features.filter(
          (f) => f.text?.trim() !== "" && f.text !== undefined
        )
        : [];

      return {
        ...plan,
        features: validFeatures,
      };
    });

    return cleanedPlans.filter(
      (plan) =>
        plan.company_id === selectedCarrier?.company_id &&
        plan.plan_type?.toLowerCase().trim() === selected.toLowerCase().trim()
    );
  }, [plans, selectedCarrier, selected]);

  return (
    <div className="pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-b from-blue-100 to-white pt-14 pb-6 w-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          {selectedCarrier?.name || companyName}
        </h1>
        <p className="text-lg text-gray-700 max-w-4xl">
          {selectedCarrier?.description ||
            `Explore ${companyName}'s exclusive international SIM plans.`}
        </p>
      </div>

      {/* PLAN TYPE SELECTOR */}
      <div className="flex justify-center items-center my-6">
        <ul className="bg-gray-50 border rounded-full shadow-inner w-fit p-1 flex md:gap-x-4 smgap-x-2">
          {planTypeArr.map(({ label, value }) => (
            <li
              key={value}
              onClick={() => setSelected(value)}
              className={`cursor-pointer text-sm md:text-base font-medium px-6 py-2 rounded-full transition-all duration-200 
                ${selected === value
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-blue-100"
                }`}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ Display Filtered Plans */}
      {loading ? (
        <div className="px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-60 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        filteredPlans.length > 0 ? (
          <PlansCards PlansData={filteredPlans} clickedButton={clickedButton} />
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No {selected} plans available for {companyName}.
          </div>
        )
      )}
    </div>
  );
}

export default CompanyPage;
