import React from 'react';
import { CircleCheck, CircleQuestionMark } from 'lucide-react';


const PlansCards = ({ PlansData }) => {
    return (
        <div className="grid grid-cols-3 w-full px-40 py-10 gap-6">
            {PlansData.map((plan, index) => (
                <div className="relative h-full" key={index}>
                    {/* Capsule header */}
                    {plan.capsuleHeader && (
                        <div className="flex justify-center items-center absolute -top-4 left-1/2 -translate-x-1/2">
                            <p className="w-fit bg-blue-500 px-6 py-1 rounded-full text-white">
                                {plan.capsuleHeader}
                            </p>
                        </div>
                    )}

                    {/* Card */}
                    <div className="hover:pt-1 rounded-xl hover:bg-blue-500 transition-all h-full">
                        <div className="bg-white border border-blue-400 shadow-lg rounded-xl h-full w-full px-6 py-8 hover:shadow-xl transition-shadow space-y-2">
                            <div className="flex flex-col justify-center items-center gap-y-2">
                                {/* Title */}
                                <h1 className="text-lg font-semibold">{plan.title}</h1>

                                {/* Price */}
                                <div className="flex flex-col items-center my-3">
                                    <p className="text-4xl font-extrabold text-gray-900">
                                        {plan.price}
                                    </p>
                                    <p className="text-gray-400 line-through text-sm mb-2">
                                        {plan.offPrice}
                                    </p>
                                    <p className="text-gray-500 text-sm">/{plan.duration}</p>
                                </div>

                                {/* Button */}
                                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg">
                                    View Details
                                </button>

                                {/* Divider */}
                                <hr className="w-full border-gray-200 my-5" />
                            </div>

                            {/* Features */}
                            <div className="flex flex-col gap-2 text-sm text-gray-700">
                                {
                                    plan.features && plan.features.length > 0 ? (
                                        plan.features.map((feature, fIndex) => (
                                            <p className="flex gap-x-1" key={fIndex}>
                                                <CircleCheck fill="blue" color="white" />
                                                <span className="my-auto">{feature?.text}</span>
                                                {
                                                    (feature?.text?.length !== 0 && feature?.info?.length !== 0) && (
                                                        <CircleQuestionMark className="fill-gray-500 text-white" />
                                                    )
                                                }
                                            </p>
                                        ))
                                    ) : null
                                }
                            </div>
                        </div>
                    </div>

                    {/* Discount Badge */}
                    {
                        plan.discountPercentage && (
                            <div className="flex justify-center items-center absolute top-0 right-0">
                                <p className="w-fit bg-blue-500 px-6 py-1 text-sm rounded-tr-xl rounded-bl-xl text-white">
                                    {plan.discountPercentage}% OFF
                                </p>
                            </div>
                        )
                    }

                </div>
            ))}
        </div>
    );
};

export default PlansCards;
