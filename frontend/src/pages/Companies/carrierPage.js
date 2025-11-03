import React from "react";
import { Link, useLocation } from "react-router-dom";

const carriers = [
    {
        name: "AT & T",
        logo: "/CarrierLogos/At_logo.png",
        description: "Stay connected worldwide with AT & T’s reliable global network.",
    },
    {
        name: "LinkUp Mobile",
        logo: "/CarrierLogos/linkup_logo.png",
        description: "Experience lightning-fast connectivity with LinkUp Mobile’s international coverage.",
    },
    {
        name: "T-Mobile",
        logo: "/CarrierLogos/TMobiles_logo.jpg",
        description: "Flexible international data plans tailored for travelers and businesses.",
    },
    {
        name: "Lyca Mobile",
        logo: "/CarrierLogos/lyca_logo.webp",
        description: "Affordable global connectivity powered by Lyca Mobile’s vast network.",
    },
];

export default function CarrierPage() {

    const location = useLocation();
    const clickedButton = location.state?.clickedButton || "None";

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="text-center mb-12 bg-gradient-to-b pt-14 pb-6 from-blue-100 to-white ">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
                    Choose Your Global Carrier
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Connect with trusted international SIM providers and explore affordable global plans to stay online anywhere in the world.
                </p>
            </div>

            {/* Carrier Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-20">
                {carriers.map((carrier, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow rounded-xl p-6 flex flex-col items-center text-center"
                    >
                        <img
                            src={carrier.logo}
                            alt={carrier.name}
                            className="w-20 h-20 object-contain mb-4"
                        />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {carrier.name}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">{carrier.description}</p>
                        <Link to={`/companies/${carrier.name}`} state={{ clickedButton: clickedButton }} className="mt-auto bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition">
                            Explore Plans
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
