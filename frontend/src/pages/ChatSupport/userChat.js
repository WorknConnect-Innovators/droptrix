import React, { useEffect, useState, useRef } from "react";

export default function UserChat() {
    const ws = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const parsedData = JSON.parse(userData);
            setUsername(parsedData.username);
        }
    }, [])

    // ---------------- CONNECT SOCKET ----------------
    useEffect(() => {
        ws.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/user_${username}/`
        );

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, data]);
        };

        return () => ws.current.close();
    }, [username]);

    const sendMessage = () => {
        if (!input.trim()) return;

        ws.current.send(JSON.stringify({ message: input }));
        setInput("");
    };

    return (
        <div className="w-full h-screen bg-gray-100 flex justify-center items-center p-4">
            <div className="w-full max-w-md h-[90vh] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-blue-600 text-white p-4 text-center text-xl font-semibold shadow">
                    Support Chat
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`p-3 max-w-[75%] rounded-xl text-sm ${msg.sender === username
                                ? "bg-blue-600 text-white ml-auto"
                                : "bg-gray-200 text-gray-900"
                                }`}
                        >
                            {msg.message}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-white flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>
    );
}
