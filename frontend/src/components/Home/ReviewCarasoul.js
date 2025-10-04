import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  { name: "Ali Khan", comment: "Amazing service! The coverage is strong everywhere I go." },
  { name: "Sara Ahmed", comment: "Customer support is outstanding and very helpful." },
  { name: "John Doe", comment: "Reliable 5G internet speed at affordable prices." },
  { name: "Amna Sheikh", comment: "Activation process was smooth and quick." },
  { name: "Michael Smith", comment: "Affordable, dependable, and simple to manage plans." },
];

function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % reviews.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-16 bg-white">
      <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-10">
        Customer Reviews
      </h2>

      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-6 overflow-hidden">
          {reviews.map((review, index) => {
            const isActive = index === current;

            return (
              <div
                key={index}
                className={`transition-all duration-500 ease-in-out rounded-lg border px-6 py-4 text-center ${
                  isActive
                    ? "w-72 md:w-80 bg-blue-50 scale-105 shadow-sm"
                    : "w-60 md:w-64 bg-gray-50 opacity-70"
                }`}
              >
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  "{review.comment}"
                </p>
                <h4 className="text-gray-900 font-semibold text-sm">
                  — {review.name}
                </h4>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

export default ReviewsCarousel;
