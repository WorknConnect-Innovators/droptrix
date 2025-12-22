import React, { useEffect, useRef, useState } from "react";

export default function AdminChat() {
    const ws = useRef(null);
    const ADMIN_USERNAME = localStorage.getItem("username"); // admin signup username

    const [users, setUsers] = useState({});
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [input, setInput] = useState("");

    useEffect(() => {
        ws.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/admin/?username=${ADMIN_USERNAME}`
        );

        ws.current.onmessage = (e) => {
            const data = JSON.parse(e.data);

            // presence
            if (data.status) {
                setUsers(prev => ({
                    ...prev,
                    [data.username]: prev[data.username] || ""
                }));
                return;
            }

            if (data.type === "chat.message") {
                const chatUser = data.sender_is_admin
                    ? data.target_username
                    : data.sender_username;

                setUsers(prev => ({
                    ...prev,
                    [chatUser]: data.message
                }));

                setMessages(prev => [...prev, data]);
            }
        };

        return () => ws.current.close();
    }, []);

    const sendMessage = () => {
        if (!input.trim() || !selectedUser) return;

        ws.current.send(JSON.stringify({
            message: input,
            target_username: selectedUser
        }));

        setInput("");
    };

    return (
        <div className="grid grid-cols-4 h-screen">
            <div className="bg-gray-100 p-4 border-r">
                <h2 className="text-xl font-bold mb-4">Users</h2>
                {Object.keys(users).map(u => (
                    <div
                        key={u}
                        onClick={() => setSelectedUser(u)}
                        className={`p-3 mb-2 cursor-pointer rounded-xl ${
                            selectedUser === u ? "bg-blue-600 text-white" : "bg-white"
                        }`}
                    >
                        <div className="font-semibold">{u}</div>
                        <div className="text-sm opacity-70">{users[u]}</div>
                    </div>
                ))}
            </div>

            <div className="col-span-3 flex flex-col">
                <div className="p-4 border-b font-bold">
                    {selectedUser ? `Chat with ${selectedUser}` : "Select a user"}
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {messages
                        .filter(m => m.target_username === selectedUser)
                        .map((m, i) => (
                            <div
                                key={i}
                                className={`p-3 my-2 max-w-[70%] rounded-xl ${
                                    m.sender_is_admin
                                        ? "bg-green-600 text-white ml-auto"
                                        : "bg-gray-300"
                                }`}
                            >
                                {m.message}
                            </div>
                        ))}
                </div>

                {selectedUser && (
                    <div className="p-3 border-t flex gap-2">
                        <input
                            className="flex-1 border rounded-xl px-3 py-2"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-green-600 text-white px-4 rounded-xl"
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}