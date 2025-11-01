import React, { useState } from "react";
import { MessageSquare, Mail, Phone, MapPin, Bot, Send } from "lucide-react";

const ContactUs = () => {
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6 lg:px-32 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Get in Touch with <span className="text-blue-600">Droptrix</span>
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Whether you need support, have questions, or just want to say hi — we’re here for you.
        </p>
      </div>

      {/* Options Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
        {/* Chat with Bot */}
        <div
          onClick={() => setIsBotOpen(true)}
          className="group cursor-pointer border border-blue-200 hover:border-blue-500 bg-white shadow-md hover:shadow-xl rounded-2xl p-8 flex flex-col items-center text-center transition-all"
        >
          <Bot className="text-blue-500 mb-4" size={50} />
          <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
            Chat with Our Smart Assistant
          </h2>
          <p className="text-gray-600 mb-4">
            Get instant help and answers from our AI-powered support bot.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
            Start Chat
          </button>
        </div>

        {/* Simple Contact Form */}
        <div className="bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-2xl p-8 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="text-blue-500" />
            <h2 className="text-xl font-semibold">Send Us a Message</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-16 text-center space-y-2 text-gray-700">
        <p className="flex justify-center items-center gap-2">
          <Phone className="text-blue-500" size={18} /> +1 234 567 890
        </p>
        <p className="flex justify-center items-center gap-2">
          <Mail className="text-blue-500" size={18} /> support@drptrix.com
        </p>
        <p className="flex justify-center items-center gap-2">
          <MapPin className="text-blue-500" size={18} /> New York, USA
        </p>
      </div>

      {/* Chatbot Modal */}
      {isBotOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6 shadow-xl relative">
            <button
              onClick={() => setIsBotOpen(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="text-blue-500" />
              <h2 className="font-semibold text-lg">Drptrix Virtual Assistant</h2>
            </div>
            <div className="h-64 border border-gray-200 rounded-lg p-4 overflow-y-auto text-sm text-gray-700">
              <p className="text-gray-600 italic">
                👋 Hi there! How can I help you today?
              </p>
              {/* Future: Integrate a chatbot or backend here */}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
