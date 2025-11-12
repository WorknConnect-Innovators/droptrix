import React, { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCcw } from "lucide-react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

function SignupPage() {

  const navigate = useNavigate();

  const testimonials = [
    {
      text: "You are the best company! Your plans are affordable and customer service is top-notch.",
      author: "– Sarah Williams",
    },
    {
      text: "Amazing network coverage and simple setup process. Best service ever. Highly recommended!",
      author: "– Ahmed Raza",
    },
    {
      text: "Love how easy it is to manage everything online. Keep up the great work!",
      author: "– Emily Johnson",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "" , username: "",  user_type:"superadmin"});
  const [errors, setErrors] = useState({});
  const [isVerifiedStep, setIsVerifiedStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalCode, setOriginalCode] = useState("");

  // rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.full_name.trim()) tempErrors.full_name = "Full name is required.";
    if (!formData.username.trim()) tempErrors.username = "Username is required.";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email.";
    }
    if (!formData.password.trim()) {
      tempErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // ✅ handle form submit (send data to backend)
  const handleSubmit = async () => {

    try {
      const response = await fetch("https://droptrix.vercel.app/api/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Signup Completed");
      } else {
        message.error(data.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      message.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
      setVerificationCode("");
      setOriginalCode("");
      navigate("/login");
    }
  };

  const sendVerificationCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) return;
    try {
      const response = await fetch("https://droptrix.vercel.app/api/verify-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ver_email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Verification code sent to your email!");
        setOriginalCode(data?.code);
        setIsVerifiedStep(true);
      } else {
        message.error(data.error || "Failed to send verification code. Please try again.");
      }
    } catch (error) {
      console.error(error);
      message.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ handle verification
  const handleVerification = (e) => {
    e.preventDefault();
    setLoading(true);

    if (verificationCode === originalCode) {
      handleSubmit();
    } else {
      message.error("Invalid verification code. Try again!");
    }
  };

  const handleResendEmail = () => {
    setEmailSent(true);
    message.info("Verification email resent!");
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="bg-blue-100 min-h-screen flex items-center justify-center p-4 sm:p-10 lg:p-20">
      <div className="w-full max-w-6xl bg-white rounded-xl flex flex-col-reverse md:flex-row overflow-hidden shadow-xl">
        {/* Left Side – Signup Form */}
        <div className="w-full md:w-2/3 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-100">
            <img src="logo.jpg" alt="logo" className="h-10 sm:h-14 object-contain" />
            <p className="text-sm sm:text-base text-gray-700">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Log in
              </a>
            </p>
          </div>

          {/* Content Area */}
          <div className="p-6 sm:p-10 flex-1">
            {!isVerifiedStep ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
                  Create your Account
                </h2>
                <form className="space-y-5" onSubmit={sendVerificationCode}>
                  <div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      autoComplete="false"
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className={`w-full border ${errors.username ? "border-red-400" : "border-gray-300"
                        } rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required
                    />
                    {errors.username && (
                      <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.full_name}
                      autoComplete="false"
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className={`w-full border ${errors.full_name ? "border-red-400" : "border-gray-300"
                        } rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      autoComplete="false"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full border ${errors.email ? "border-red-400" : "border-gray-300"
                        } rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      autoComplete="false"
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`w-full border ${errors.password ? "border-red-400" : "border-gray-300"
                        } rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
                  >
                    {loading ? "Processing..." : "Sign Up"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
                  Verify Your Account
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  We’ve sent a verification code to your email. Please enter it below to complete your signup.
                </p>
                <form onSubmit={handleVerification} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition"
                    >
                      {loading ? "Processing..." : "Verify"}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={emailSent}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm transition"
                    >
                      <RefreshCcw
                        className={`w-4 h-4 ${emailSent ? "animate-spin" : ""}`}
                      />
                      {emailSent ? "Email Resent!" : "Resend Email"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Right Side – Testimonials */}
        <div className="w-full md:w-1/3 bg-blue-500 text-white flex flex-col items-center justify-between px-6 sm:px-8 py-10 sm:py-16 md:py-20 transition-all duration-700">
          <img
            src="auth.svg"
            alt="auth"
            className="w-2/3 sm:w-3/4 h-40 sm:h-52 md:h-56 object-contain mb-6"
          />

          <div className="text-center px-2 sm:px-4">
            <p className="text-sm sm:text-base italic leading-relaxed mb-3 transition-opacity duration-500">
              “{testimonials[current].text}”
            </p>
            <span className="font-semibold text-sm sm:text-base">
              {testimonials[current].author}
            </span>

            <div className="flex justify-center mt-4 gap-2">
              {testimonials.map((_, index) => (
                <span
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${current === index ? "bg-white" : "bg-white/50"
                    }`}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
