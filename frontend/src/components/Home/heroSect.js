import React from "react";
import { motion } from "framer-motion";
import { Globe, Zap, Clock } from "lucide-react";

const HeroSection = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-[#0072ff] to-[#00c6a7] text-white py-24">
            {/* Content */}
            <div className="relative container mx-auto px-6 text-center">
                {/* Heading */}
                <motion.h1
                    className="text-4xl sm:text-5xl font-bold mb-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    Buy, Activate & Manage Effortlessly
                </motion.h1>

                <motion.p
                    className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Experience instant global connectivity with Droptrix — the platform that simplifies international SIM activation.
                </motion.p>

                {/* Search Bar */}
                <motion.div
                    className="flex items-center w-full sm:w-[550px] mx-auto bg-white/15 backdrop-blur-md rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-all duration-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <Globe className="text-white opacity-80 mr-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search by country or provider..."
                        className="bg-transparent w-full outline-none text-white placeholder-white/70"
                    />
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    className="flex justify-center gap-24 mt-12 flex-wrap"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    {[
                        { icon: <Globe size={26} />, title: "10+", text: "Providers" },
                        { icon: <Zap size={26} />, title: "5G", text: "Speed" },
                        { icon: <Clock size={26} />, title: "Instant", text: "Activation" },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <div className="flex flex-col items-center">
                                <div className="mb-2 opacity-90">{item.icon}</div>
                                <h3 className="text-xl font-semibold">{item.title}</h3>
                                <p className="text-sm text-white/80">{item.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
