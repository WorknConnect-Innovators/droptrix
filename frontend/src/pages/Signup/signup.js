import React, { useState, useEffect } from "react";

function SignupPage() {
    const testimonials = [
        {
            text: "You are the best company! Your plans are affordable and customer service is top-notch.",
            author: "– Sarah Williams",
        },
        {
            text: "Amazing network coverage and simple setup process. Best service ever. Highly recommended!",
            author: "– Ahmed Raza",
        },
        {
            text: "Love how easy it is to manage everything online. Keep up the great work!",
            author: "– Emily Johnson",
        },
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    return (
        <div className="bg-blue-100 min-h-screen flex items-center justify-center p-4 sm:p-10 lg:p-20">
            <div className="w-full max-w-6xl bg-white rounded-xl flex flex-col-reverse md:flex-row overflow-hidden">
                {/* Left Side – Signup Form */}
                <div className="w-full md:w-2/3 flex flex-col">
                    {/* Header Section */}
                    <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-100">
                        <img
                            src="logo.jpg"
                            alt="logo"
                            className="h-10 sm:h-14 object-contain"
                        />
                        <p className="text-sm sm:text-base text-gray-700">
                            Already have an account?
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="p-6 sm:p-10 flex-1">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
                            Create your Account
                        </h2>
                        <form className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
                            >
                                Sign Up
                            </button>
                        </form>

                        <p className="text-sm text-gray-600 mt-4 text-center sm:text-left">
                            Already have an account?{" "}
                            <a href="/login" className="text-blue-600 hover:underline">
                                Log in
                            </a>
                        </p>
                    </div>
                </div>

                {/* Right Side – Testimonial Slider */}
                <div className="w-full md:w-1/3 bg-blue-500 text-white flex flex-col items-center justify-between px-6 sm:px-8 py-10 sm:py-16 md:py-20 transition-all duration-700">
                    <img
                        src="auth.svg"
                        alt="auth"
                        className="w-2/3 sm:w-3/4 h-40 sm:h-52 md:h-56 object-contain mb-6"
                    />

                    <div className="text-center px-2 sm:px-4">
                        <p className="text-sm sm:text-base italic leading-relaxed mb-3 transition-opacity duration-500">
                            “{testimonials[current].text}”
                        </p>
                        <span className="font-semibold text-sm sm:text-base">
                            {testimonials[current].author}
                        </span>

                        {/* Dots */}
                        <div className="flex justify-center mt-4 gap-2">
                            {testimonials.map((_, index) => (
                                <span
                                    key={index}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${current === index ? "bg-white" : "bg-white/50"
                                        }`}
                                ></span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
