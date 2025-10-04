import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqsData = {
    "Prepaid Plans": [
        {
            q: "How long does a prepaid plan last?",
            a: "Our prepaid plans typically last for 30 days, but you can recharge anytime to extend your service."
        },
        {
            q: "Can I switch plans mid-cycle?",
            a: "Yes! You can switch to a different prepaid plan at any time. The new plan will be activated immediately."
        },
    ],
    "Company": [
        {
            q: "Where is Droptrix headquartered?",
            a: "Droptrix is headquartered in Pakistan, serving customers nationwide with reliable connectivity."
        },
        {
            q: "Does Droptrix have customer support?",
            a: "Yes, we provide 24/7 customer support through chat, phone, and email."
        },
    ],
    "Network": [
        {
            q: "Do you provide 5G coverage?",
            a: "Yes! We offer high-speed 5G connectivity in major cities, and coverage is expanding every month."
        },
        {
            q: "Can I use Droptrix abroad?",
            a: "Yes, international roaming is supported on most of our prepaid and postpaid plans."
        },
    ],
    "Carriers": [
        {
            q: "Which carriers are supported?",
            a: "We partner with top-rated carriers to provide maximum coverage nationwide."
        },
        {
            q: "Can I keep my current carrier number?",
            a: "Yes, you can port your existing number when switching to Droptrix."
        },
    ],
};

function FAQSection() {
    const [activeCategory, setActiveCategory] = useState("Prepaid Plans");
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="bg-blue-50 py-16 lg:px-40 md:px-20 sm:px-10 px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
                Frequently Asked Questions
            </h2>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                {Object.keys(faqsData).map((category) => (
                    <button
                        key={category}
                        onClick={() => {
                            setActiveCategory(category);
                            setOpenIndex(null);
                        }}
                        className={`px-5 py-2 rounded-full font-medium transition ${activeCategory === category
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* FAQs */}
            <div className="max-w-5xl mx-auto space-y-4">
                {faqsData[activeCategory].map((faq, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                    >
                        <button
                            className={`w-full flex justify-between items-center px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 ${openIndex === index ? "bg-gray-50" : ""}`}
                            onClick={() =>
                                setOpenIndex(openIndex === index ? null : index)
                            }
                        >
                            {faq.q}
                            {openIndex === index ? (
                                <ChevronUp className="w-5 h-5 text-blue-600" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                        {openIndex === index && (
                            <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FAQSection;
