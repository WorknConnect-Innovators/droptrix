import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CardSim } from "lucide-react";

const HeroSection = () => {
    const navigate = useNavigate();

    const slides = [
        {
            heading: "Welcome to Droptrix",
            paragraph:
                "Simplify how you store, manage, and share files — built for teams and individuals who value speed, simplicity, and security.",
            buttonText: "Get Started",
            link: "/get-started",
        },
        {
            heading: "Your Files. Your Control.",
            paragraph:
                "Experience cloud freedom with smart management tools and enterprise-grade protection to keep everything safe and accessible.",
            buttonText: "Explore Features",
            link: "/features",
        },
        {
            heading: "Collaborate Effortlessly",
            paragraph:
                "Work together with your team in real time — upload, organize, and share without barriers or delays.",
            buttonText: "Join Now",
            link: "/signup",
        },
    ];

    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!isPaused) {
            intervalRef.current = setInterval(() => {
                setCurrent((prev) => (prev + 1) % slides.length);
            }, 6000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPaused, slides.length]);

    return (
        <div
            className="relative flex flex-col md:flex-row items-center justify-between min-h-[80vh] w-full bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 px-8 sm:px-16 lg:px-24 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background circles */}
            <div className="absolute top-10 -left-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl opacity-30 animate-pulse" />
            <div className="absolute bottom-10 right-0 w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-30 animate-pulse" />

            {/* LEFT SECTION - Animated Text */}
            <div className="z-10 w-full md:w-1/2 flex flex-col justify-center space-y-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                            {slides[current].heading}
                        </h1>
                        <p className="text-gray-700 text-lg sm:text-xl lg:text-2xl max-w-lg leading-relaxed mb-8">
                            {slides[current].paragraph}
                        </p>
                        <button
                            onClick={() => navigate(slides[current].link)}
                            className="bg-blue-600 text-white py-3 px-10 text-lg font-semibold rounded-full shadow-md hover:shadow-xl hover:bg-blue-700 transition-all duration-300"
                        >
                            {slides[current].buttonText}
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* RIGHT SECTION - Static Image */}
            <div className="z-10 w-full md:w-1/2 flex justify-center mt-12 md:mt-0">
                <img
                    src="/network.png"
                    alt="Hero Illustration"
                    className="w-[100%] md:w-[80%] lg:w-[70%] h-auto object-contain drop-shadow-2xl"
                />
            </div>

            {/* Decorative floating circles */}
            <motion.div
                className="absolute top-[30%] left-[45%] w-8 h-8 bg-blue-300 rounded-full opacity-70"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[25%] right-[30%] w-6 h-6 bg-blue-400 rounded-full opacity-70"
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[40%] right-[10%] opacity-70 flex items-center justify-center"
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            >
                <CardSim color="white" size={30} />
            </motion.div>
        </div>
    );
};

export default HeroSection;
