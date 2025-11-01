import React from 'react'
import { CardSim, Power, Cloud, BadgeDollarSign, ArrowRight, Users } from "lucide-react"  // lucide icons
import ChoiceSection from '../../components/Home/choiceSection'
import WhyUs from '../../components/Home/whyUs'
import FAQSection from '../../components/Home/FAQSection'
import WriteReviewSection from '../../components/Home/writeReview'
import HeroSection from '../../components/Home/heroSect'
import { motion } from "framer-motion";
import { Link } from 'react-router-dom'
function HomePage() {
    return (
        <>
            <HeroSection />
            {/* <HeroSlider /> */}

            {/* Call to Action Section */}
            <div className='bg-blue-50 lg:px-40 md:px-20 sm:px-10 px-6 '>
                <motion.div
                    className="relative bottom-14"
                    initial={{ y: 100, opacity: 0 }}   // start from below & invisible
                    animate={{ y: 0, opacity: 1 }}     // move to normal position
                    transition={{
                        delay: 1,
                        duration: 0.8,
                        ease: "easeOut",
                    }}
                >
                    <div className="bg-white space-y-8 shadow-xl rounded-xl py-10 px-6 flex flex-col justify-center items-center text-center">
                        <div className='space-y-3'>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Join Droptrix Today!
                            </h2>
                            <p className="text-gray-600 max-w-xl">
                                Get superfast, reliable coverage at low prices. All with international calling &amp; high speed 5G data.
                            </p>
                        </div>

                        {/* Icon Row */}
                        <div className="flex flex-col sm:flex-row sm:gap-y-0 gap-y-4 lg:w-2/5 md:w-3/5 sm:w-4/5 w-full justify-between">
                            {/* carriers  */}
                            <div className="flex flex-col items-center w-full">
                                <Link to="/carriers">
                                    <div className="w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full text-white shadow-md">

                                        <Cloud className="w-8 h-8" />
                                    </div>
                                </Link>
                                <span className="mt-3 font-medium text-gray-800">Carriers</span>
                            </div>
                            {/* Plans */}
                            <div className="flex flex-col items-center w-full">
                                <div className="w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full text-white shadow-md">
                                    <CardSim className="w-8 h-8" />
                                </div>
                                <span className="mt-3 font-medium text-gray-800">Plans</span>
                            </div>

                            {/* Activate SIM */}
                            <div className="flex flex-col items-center w-full">
                                <div className="w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full text-white shadow-md">
                                    <Power className="w-8 h-8" />
                                </div>
                                <span className="mt-3 font-medium text-gray-800">Activate SIM</span>
                            </div>

                        </div>

                        <p className="flex items-center gap-x-2 justify-center text-gray-700 font-medium">
                            <img src="dropLogo.png" alt="Droptrix Logo" className="h-6" />
                            <div className='sm:text-base text-sm'>
                                <span>Already part of <span className="font-bold text-blue-700">Droptrix?</span></span>
                                <a
                                    href="/login"
                                    className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition"
                                >
                                    Log in
                                </a>
                            </div>
                        </p>

                    </div>
                </motion.div>

            </div>

            <ChoiceSection />
            <WhyUs />

            <div className="bg-blue-600 text-white text-center py-8 px-6 lg:px-40 md:px-20 sm:px-10 text-xl font-semibold flex items-center justify-center gap-3">
                {/* Icon before text */}
                <BadgeDollarSign className="w-7 h-7 text-white" />

                <span>Enjoy the lowest prices</span>

                {/* View Plans with arrow animation */}
                <a
                    href="/plans"
                    className="ml-4 flex items-center gap-2 group transition duration-300"
                >
                    <span className="underline decoration-2 underline-offset-2">View Plans</span>
                    <ArrowRight className="w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-2" />
                </a>
            </div>

            <FAQSection />

            <div className="bg-blue-600 text-white text-center py-8 px-6 lg:px-40 md:px-20 sm:px-10 text-xl font-semibold flex items-center justify-center gap-3">
                {/* Icon before text */}
                <Users className="w-7 h-7 text-white" />

                <span>Our Team is here to help you</span>

                {/* Contact Us with arrow animation */}
                <a
                    href="/contact"
                    className="ml-4 flex items-center gap-2 group transition duration-300"
                >
                    <span className="underline decoration-2 underline-offset-2">Contact Us</span>
                    <ArrowRight className="w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-2" />
                </a>
            </div>

            <WriteReviewSection />
            {/* <ReviewsCarousel /> */}
            <div className="bg-blue-50 py-12 px-6 lg:px-32">
                <div className="max-w-4xl mx-auto text-center space-y-5">
                    <h2 className="text-3xl font-semibold text-gray-800">
                        Subscribe to our Newsletter
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full sm:w-2/3 border border-gray-300 rounded-md py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-3 px-6 transition">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePage
