import React, { useState } from "react";

function WriteReviewSection() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const wordLimit = 25;

    const words = comment.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const handleCommentChange = (e) => {
        const input = e.target.value;
        const inputWords = input.trim().split(/\s+/).filter(Boolean);

        if (inputWords.length <= wordLimit) {
            setComment(input);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || wordCount === 0) return;

        setLoading(true);

        try {
            const res = await fetch(`${process.env.React_API_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, comment }),
            });

            if (res.ok) {
                alert("Thank you for your feedback!");
                setName("");
                setEmail("");
                setComment("");
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = name && email && wordCount > 0;

    return (
        <div className="py-16 lg:px-40 md:px-20 sm:px-10 px-6">
            <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                {/* Left Side - Text */}
                <div className="space-y-3">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                        Share Your Experience
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Your feedback helps us grow and improve. Whether it’s about our
                        plans, coverage, or customer service — we’d love to hear your
                        thoughts. Feel free to share your experience and help others make
                        informed decisions.
                    </p>
                </div>

                {/* Right Side - Form */}
                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                    {/* Name + Email */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Comment */}
                    <div>
                        <textarea
                            value={comment}
                            onChange={handleCommentChange}
                            placeholder="Write your comment..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-28 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                            required
                        ></textarea>
                        {
                            wordCount >= wordLimit && (
                                <div
                                    className={`text-xs mt-1 ${wordCount >= wordLimit ? "text-red-600" : "text-gray-500"
                                        }`}
                                >
                                    {wordCount} / {wordLimit} words
                                </div>
                            )
                        }

                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className={`px-5 py-2 rounded-md text-sm font-medium transition ${!isFormValid || loading
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default WriteReviewSection;
