import React, { useEffect, useRef, useState } from "react";

export default function AdminChat() {
    const ws = useRef(null);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [input, setInput] = useState("");

    useEffect(() => {
        ws.current = new WebSocket("ws://127.0.0.1:8000/ws/chat/admin/");

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Chat message
            if (data.type === "chat.message") {
                const uname = data.sender_username;

                setUsers(prev => ({
                    ...prev,
                    [uname]: data.message
                }));

                setMessages(prev => [...prev, data]);
            }

            // Online/Offline
            if (data.status) {
                const uname = data.username;
                setUsers(prev => ({
                    ...prev,
                    [uname]: prev[uname] || ""
                }));
            }
        };

        return () => ws.current.close();
    }, []);

    const sendMessage = () => {
        if (!input.trim() || !selectedUser) return;

        ws.current.send(
            JSON.stringify({
                message: input,
                target_username: selectedUser,
            })
        );

        setInput("");
    };

    return (
        <div className="grid grid-cols-4 h-screen">

            {/* SIDEBAR */}
            <div className="bg-gray-100 p-4 border-r">
                <h2 className="text-xl font-bold mb-4">Users</h2>

                <div className="space-y-2">
                    {Object.keys(users).map(username => (
                        <div
                            key={username}
                            className={`p-3 rounded-xl cursor-pointer shadow-sm ${selectedUser === username
                                    ? "bg-blue-600 text-white"
                                    : "bg-white"
                                }`}
                            onClick={() => setSelectedUser(username)}
                        >
                            <div className="font-semibold">{username}</div>
                            <div className="text-sm opacity-70">
                                {users[username]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CHAT AREA */}
            <div className="col-span-3 flex flex-col">
                <div className="p-4 border-b text-xl font-bold bg-white shadow">
                    {selectedUser ? `Chat with ${selectedUser}` : "Select a User"}
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {messages
                        .filter(
                            msg =>
                                msg.sender_username === selectedUser ||
                                msg.target_username === selectedUser
                        )
                        .map((msg, i) => (
                            <div
                                key={i}
                                className={`p-3 my-2 max-w-[70%] rounded-xl ${msg.sender_is_admin
                                        ? "bg-green-600 text-white ml-auto"
                                        : "bg-gray-300"
                                    }`}
                            >
                                {msg.message}
                            </div>
                        ))}
                </div>

                {/* Input */}
                {selectedUser && (
                    <div className="p-3 border-t bg-white flex gap-2">
                        <input
                            className="flex-1 px-3 py-2 border rounded-xl"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write a message..."
                        />
                        <button
                            onClick={sendMessage}
                            className="px-5 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
