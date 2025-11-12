import React from "react";
import { useNavigate } from "react-router-dom";

function PageNotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-blue-50 to-blue-200 text-gray-800">
            <div className="flex flex-col items-center gap-y-10 text-center px-4">
                {/* 404 Image */}
                <img
                    src="/404.svg"
                    alt="Page Not Found"
                    className="w-72 md:w-96 drop-shadow-lg"
                />

                {/* Text Section */}
                <div>
                    <h1 className="text-5xl font-extrabold text-blue-700 mb-2">
                        404
                    </h1>
                    <h2 className="text-2xl font-semibold mb-3">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        The page you’re looking for doesn’t exist or has been moved.
                        Let’s get you back on track.
                    </p>
                </div>

                {/* Button */}
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200"
                >
                    Back To Home
                </button>
            </div>
        </div>
    );
}

export default PageNotFound;
