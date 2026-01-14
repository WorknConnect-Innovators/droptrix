import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {

    const searchData = [
        { type: "country", name: "United States", link: "/carriers" },
        { type: "provider", name: "AT&T", link: "/companies/AT&T" },
        { type: "provider", name: "T-Mobile", link: "/companies/T-Mobile" },
        { type: "provider", name: "Lyca Mobile", link: "/companies/Lyca Mobile" },
    ];

    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        if (!query) return [];
        return searchData.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );
    }, [query]);

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
                <div className="relative w-full sm:w-[550px] mx-auto">
                    <motion.div
                        className="flex items-center w-full sm:w-[550px] mx-auto bg-white/15 backdrop-blur-md rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-all duration-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <Globe className="text-white opacity-80 mr-3" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by country or provider..."
                            className="bg-transparent w-full outline-none text-white placeholder-white/70"
                        />
                    </motion.div>

                    {query && (
                        <div className="absolute text-left w-full mt-2 bg-white text-black rounded-xl shadow-lg overflow-hidden z-10">
                            {results.length > 0 ? (
                                results.map((item, i) => (
                                    <div
                                        key={i}
                                        className="px-5 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        {item.type === "country" ? (
                                            <Link to={item.link}>
                                                Explore carrier plans in <b>{item.name}</b>
                                            </Link>
                                        ) : (
                                            <Link to={item.link}>
                                                Explore plans by <b>{item.name}</b>
                                            </Link>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-5 py-3 text-sm text-gray-500">
                                    ❌ No related result found
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
