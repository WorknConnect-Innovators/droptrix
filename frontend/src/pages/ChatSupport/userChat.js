import React, { useEffect, useState, useRef } from "react";

export default function UserChat() {
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const parsed = JSON.parse(userData);
            setUsername(parsed.username); // MUST exist
        }
    }, []);

    // Load chat history on mount
    useEffect(() => {
        if (!username) return;

        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData && userData.id) {
            fetch(`http://127.0.0.1:8000/api/chat/${userData.id}/`)
                .then(res => res.json())
                .then(data => {
                    if (data.messages) {
                        const formattedMessages = data.messages.map(msg => ({
                            message: msg.text,
                            sender: msg.sender_username,
                            timestamp: msg.timestamp
                        }));
                        setMessages(formattedMessages);
                    }
                })
                .catch(err => console.error("Failed to load chat history:", err));
        }
    }, [username]);

    // ---------------- CONNECT SOCKET ----------------
    useEffect(() => {
        if (!username) return;

        ws.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/${username}/`
        );

        ws.current.onopen = () => {
            setIsConnected(true);
            console.log("WebSocket connected");
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received message:", data);
            setMessages(prev => [...prev, data]);
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            console.log("WebSocket disconnected");
        };

        return () => ws.current?.close();
    }, [username]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || !isConnected) return;

        ws.current.send(JSON.stringify({ message: input }));
        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="w-full h-screen bg-gray-100 flex justify-center items-center p-4">
            <div className="w-full max-w-md h-[90vh] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow">
                    <span className="text-xl font-semibold">Support Chat</span>
                    <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`p-3 max-w-[75%] rounded-xl text-sm ${
                                msg.sender === username
                                    ? "bg-blue-600 text-white ml-auto"
                                    : "bg-gray-200 text-gray-900"
                            }`}
                        >
                            {msg.message}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-white flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isConnected}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!isConnected || !input.trim()}
                        className={`px-5 py-2 rounded-xl shadow ${
                            isConnected && input.trim()
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>
    );
}
