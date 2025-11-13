import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function CarrierPage() {

    const [carriers, setCarriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ✅ Fetch Carriers from Backend
    const getCarriersFromBackend = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-carriers/`
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCarriersFromBackend();
    }, []);

    const location = useLocation();
    const clickedButton = location.state?.clickedButton || "None";

    const handleCarrierClick = (carrier) => {
        localStorage.setItem("selectedCarrierID", JSON.stringify(carrier?.company_id));
        navigate('/login')
    }

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

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="loader ease-linear rounded-full border-4 border-t-8 border-gray-200 h-16 w-16"></div>
                </div>
            ) : carriers.length === 0 ? (
                <div className="text-center text-gray-600">
                    No carriers available at the moment. Please check back later.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-20">
                    {carriers.map((carrier, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow rounded-xl p-6 flex flex-col items-center text-center"
                        >
                            <img
                                src={carrier.logo_url}
                                alt={carrier.name}
                                className="w-20 h-20 object-contain mb-4"
                            />
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                {carrier.name}
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">{carrier.description}</p>
                            {clickedButton === 'PayAsYouGo' ? (
                                <button
                                    onClick={() => handleCarrierClick(carrier)}
                                    className="mt-auto bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition">
                                    Make a Top-Up
                                </button>
                            ) : (
                                <Link to={`/companies/${carrier.name}`} state={{ clickedButton: clickedButton, selectedCarrier: carrier }} className="mt-auto bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition">
                                    Explore Plans
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
