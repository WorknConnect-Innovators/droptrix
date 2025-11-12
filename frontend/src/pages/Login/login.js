import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";


export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [username, setusername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // 🔹 Login Submit Handler
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://droptrix.vercel.app/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.login_status) {
                // ✅ Save token & user info to localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.data));

                message.success("Login Successful!");

                // ✅ Optional: navigate based on user_type
                if (data.data.user_type === "admin") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/");
                }
            } else {
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };


    // 🔹 Forgot Password Submit
    const handleForgotSubmit = (e) => {
        e.preventDefault();
        message.info(`Reset link sent to ${username}`);
        setShowForgotModal(false);
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-green-50 to-white">
            {/* Left Section */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12">
                <img
                    src="/network.png"
                    alt="Global Connection"
                    className="w-[75%] h-auto drop-shadow-xl"
                />
            </div>

            {/* Right Section */}
            <div className="flex flex-1 flex-col justify-center px-8 md:px-16 bg-white/80 backdrop-blur-md">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600 mb-8">
                    Log in to manage your international plans with{" "}
                    <Link to="/">
                        <span className="text-blue-600 font-semibold">Droptrix</span>
                    </Link>
                </p>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            username
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="username"
                                placeholder="you@example.com"
                                value={username}
                                onChange={(e) => setusername(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowForgotModal(true)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg font-semibold transition ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                            }`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Don’t have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Sign up now
                    </Link>
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative">
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                            Reset Password
                        </h3>
                        <p className="text-gray-600 text-sm mb-5">
                            Enter your registered username address, and we’ll send you a reset link.
                        </p>

                        <form onSubmit={handleForgotSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="username"
                                    required
                                    placeholder="you@example.com"
                                    value={username}
                                    onChange={(e) => setusername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Send Reset Link
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
