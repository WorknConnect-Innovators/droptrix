import { CardSim, Wifi, Headphones, Globe2 } from "lucide-react";
import React from 'react'

function WhyUs() {
    return (
        <div className='bg-blue-50 lg:px-40 md:px-20 sm:px-10 px-6 py-16 flex flex-col justify-center items-center text-center gap-y-14'>
            <div className='space-y-3'>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Why Choose Us?
                </h2>
                <p className="text-gray-600 max-w-xl">
                    Discover the benefits of our service and why we stand out from the competition.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Reliable Coverage */}
                <div className="text-center group">
                    <div className="p-5 rounded-full border-2 border-blue-600 w-fit mx-auto bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                        <CardSim className="w-12 h-12 text-blue-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">Reliable Coverage</h3>
                    <p className="text-gray-600 mt-2">
                        Experience consistent and dependable connectivity wherever you go.
                    </p>
                </div>

                {/* Maximum Networks */}
                <div className="text-center group">
                    <div className="p-5 rounded-full border-2 border-green-600 w-fit mx-auto bg-green-50 group-hover:bg-green-600 group-hover:text-white transition duration-300">
                        <Wifi className="w-12 h-12 text-green-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">Maximum Networks</h3>
                    <p className="text-gray-600 mt-2">
                        Connect to the widest range of networks for seamless global access.
                    </p>
                </div>

                {/* 24/7 Customer Support */}
                <div className="text-center group">
                    <div className="p-5 rounded-full border-2 border-purple-600 w-fit mx-auto bg-purple-50 group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                        <Headphones className="w-12 h-12 text-purple-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">24/7 Support</h3>
                    <p className="text-gray-600 mt-2">
                        Our team is always available to help you anytime, anywhere.
                    </p>
                </div>

                {/* Global Reach */}
                <div className="text-center group">
                    <div className="p-5 rounded-full border-2 border-red-600 w-fit mx-auto bg-red-50 group-hover:bg-red-600 group-hover:text-white transition duration-300">
                        <Globe2 className="w-12 h-12 text-red-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">Global Reach</h3>
                    <p className="text-gray-600 mt-2">
                        Stay connected across countries with hassle-free international coverage.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default WhyUs
