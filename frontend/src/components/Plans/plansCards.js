import React, { useState } from 'react';
import { CircleCheck, CircleQuestionMark, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlansCards = ({ PlansData, clickedButton }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const handleActivate = () => {
    if (clickedButton === "PayAsYouGo") {
      navigate('/paymentForm');
    } else {
      return;
    }
  }

  return (
    <>
      {/* Main Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full px-10 md:px-20 lg:px-40 py-10 gap-6">
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
            <div className="hover:pt-1 rounded-xl hover:bg-blue-50 transition-all h-full">
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
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg"
                  >
                    View Details
                  </button>

                  {/* Divider */}
                  <hr className="w-full border-gray-200 my-5" />
                </div>

                {/* Features */}
                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  {plan.features && plan.features.length > 0
                    ? plan.features.map((feature, fIndex) => (
                      <p className="flex gap-x-1" key={fIndex}>
                        <CircleCheck fill="blue" color="white" />
                        <span className="my-auto">{feature?.text}</span>
                        {feature?.info?.length !== 0 && (
                          <CircleQuestionMark className="fill-gray-500 text-white" />
                        )}
                      </p>
                    ))
                    : null}
                </div>
              </div>
            </div>

            {/* Discount Badge */}
            {plan.discountPercentage && (
              <div className="flex justify-center items-center absolute top-0 right-0">
                <p className="w-fit bg-blue-500 px-6 py-1 text-sm rounded-tr-xl rounded-bl-xl text-white">
                  {plan.discountPercentage}% OFF
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Section */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-none flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative p-8 space-y-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
            >
              <X size={24} />
            </button>

            {/* Modal Content */}
            <h2 className="text-2xl font-bold text-blue-600 text-center">
              {selectedPlan.title}
            </h2>
            <p className="text-center text-gray-500">
              {selectedPlan.capsuleHeader || 'Exclusive Plan'}
            </p>

            <div className="text-center space-y-1">
              <p className="text-4xl font-extrabold text-gray-900">
                {selectedPlan.price}
              </p>
              {selectedPlan.offPrice && (
                <p className="text-gray-400 line-through text-sm">
                  {selectedPlan.offPrice}
                </p>
              )}
              <p className="text-gray-600 text-sm">/{selectedPlan.duration}</p>
            </div>

            {/* Features */}
            <div className="mt-6 space-y-2">
              {selectedPlan.features?.map((feature, i) => (
                <p key={i} className="flex items-center gap-x-2 text-gray-700">
                  <CircleCheck fill="blue" color="white" />
                  {feature.text}
                </p>
              ))}
            </div>

            {/* CTA */}
            <div className="flex justify-center mt-6">
              <button onClick={handleActivate} className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition-transform">
                Activate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlansCards;
