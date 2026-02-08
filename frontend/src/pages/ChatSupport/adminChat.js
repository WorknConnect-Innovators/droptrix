import React, { useEffect, useRef, useState } from "react";

export default function AdminChat() {
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const user = localStorage.getItem("userData");
    const ADMIN_USERNAME = JSON.parse(user)?.username;

    const [users, setUsers] = useState({});
    const [allMessages, setAllMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [input, setInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    const formatDateLabel = (timestamp) => {
        const msgDate = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday = msgDate.toDateString() === today.toDateString();
        const isYesterday = msgDate.toDateString() === yesterday.toDateString();

        if (isToday) return "Today";
        if (isYesterday) return "Yesterday";

        return msgDate.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };


    /* ---------------- WebSocket Logic ---------------- */
    useEffect(() => {
        if (!ADMIN_USERNAME) return;

        console.log("🔌 Connecting Admin WebSocket for:", ADMIN_USERNAME);
        ws.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/admin/?username=${ADMIN_USERNAME}`
        );

        ws.current.onopen = () => {
            console.log("✅ Admin WebSocket connected:", ADMIN_USERNAME);
            setIsConnected(true);
        };

        ws.current.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                console.log("📨 Admin message received:", data);

                if (data.status) {
                    setUsers(prev => ({
                        ...prev,
                        [data.username]: {
                            lastMessage: prev[data.username]?.lastMessage || "",
                            status: data.status
                        }
                    }));
                    return;
                }

                // Determine the chat user (the non-admin participant)
                const chatUser = data.sender_is_admin ? data.receiver : data.sender;

                if (!chatUser) {
                    console.warn("⚠️ Could not determine chat user from message:", data);
                    return;
                }

                setUsers(prev => ({
                    ...prev,
                    [chatUser]: {
                        lastMessage: data.message,
                        status: prev[chatUser]?.status || "online"
                    }
                }));

                setAllMessages(prev => {
                    // 🔁 Replace optimistic message
                    if (data.client_id) {
                        const optimisticIndex = prev.findIndex(
                            m => m.client_id === data.client_id
                        );

                        if (optimisticIndex !== -1) {
                            const updated = [...prev];
                            updated[optimisticIndex] = {
                                ...updated[optimisticIndex],
                                optimistic: false,
                                timestamp: data.timestamp,
                            };
                            return updated;
                        }
                    }

                    // 🆕 New incoming message (from user)
                    return [...prev, {
                        message: data.message,
                        sender: data.sender,
                        sender_is_admin: data.sender_is_admin,
                        chatUser: data.sender_is_admin ? data.receiver : data.sender,
                        timestamp: data.timestamp
                    }];
                });

            } catch (err) {
                console.error("❌ Error processing admin message:", err);
            }
        };

        ws.current.onclose = () => {
            console.log("❌ Admin WebSocket closed");
            setIsConnected(false);
        };

        ws.current.onerror = (e) => {
            console.error("❌ Admin WebSocket error:", e);
        };

        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, [ADMIN_USERNAME]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages, selectedUser]);

    /* ---------------- Initial Load ---------------- */
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/admin/chats/")
            .then(res => res.json())
            .then(data => {
                const usersData = {};
                const messages = [];

                data.chats?.forEach(chat => {
                    usersData[chat.user_username] = {
                        lastMessage: chat.messages?.at(-1)?.text || "",
                        status: "offline"
                    };

                    chat.messages?.forEach(msg => {
                        messages.push({
                            message: msg.text,
                            sender: msg.sender_username,
                            sender_is_admin: msg.sender_username === ADMIN_USERNAME,
                            chatUser: chat.user_username,
                            timestamp: msg.timestamp
                        });
                    });
                });

                setUsers(usersData);
                setAllMessages(messages);
            });
    }, [ADMIN_USERNAME]);

    const sendMessage = () => {
        if (!input.trim() || !selectedUser || !isConnected) {
            console.warn("Cannot send message. Connected:", isConnected, "Selected user:", selectedUser);
            return;
        }

        const optimisticMessage = {
            message: input,
            sender: ADMIN_USERNAME,
            sender_is_admin: true,
            chatUser: selectedUser,
            timestamp: new Date().toISOString(),
            optimistic: true,
        };

        // ✅ Show message immediately
        setAllMessages(prev => [...prev, optimisticMessage]);

        // ✅ Update sidebar instantly
        setUsers(prev => ({
            ...prev,
            [selectedUser]: {
                ...prev[selectedUser],
                lastMessage: input,
                status: "online",
            }
        }));

        // ✅ Send to backend
        try {
            ws.current.send(JSON.stringify({
                message: input,
                target_username: selectedUser
            }));
            console.log("📤 Admin message sent to:", selectedUser);
        } catch (err) {
            console.error("❌ Failed to send admin message:", err);
        }

        setInput("");
    };


    const selectedUserMessages = allMessages.filter(m => m.chatUser === selectedUser);

    const groupedMessages = selectedUserMessages.reduce((acc, msg) => {
        const dateKey = new Date(msg.timestamp).toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(msg);
        return acc;
    }, {});

    return (
        <div className="h-[calc(100vh-8rem)] overflow-hidden grid grid-cols-4 bg-gray-100 border-2">
            {/* ---------------- Sidebar ---------------- */}
            <aside className="col-span-1 bg-white border-r sticky top-0 h-[calc(100vh-8rem)] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg">Users</h2>
                    <span className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {Object.keys(users).map(u => (
                        <div
                            key={u}
                            onClick={() => setSelectedUser(u)}
                            className={`p-3 rounded-xl cursor-pointer transition 
                                ${selectedUser === u
                                    ? "bg-green-600 text-white shadow"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{u}</p>
                                <span className={`text-xs ${users[u].status === "online" ? "text-green-400" : "text-gray-400"}`}>
                                    ●
                                </span>
                            </div>
                            <p className="text-sm truncate opacity-80">
                                {users[u].lastMessage || "No messages"}
                            </p>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ---------------- Chat Area ---------------- */}
            <section className="col-span-3 flex flex-col h-[calc(100vh-8rem)]">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 font-semibold shadow-sm z-10">
                    {selectedUser ? `Chat with ${selectedUser}` : "Select a user to start chatting"}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            {/* Date Divider */}
                            <div className="flex justify-center my-4">
                                <span className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-600">
                                    {formatDateLabel(date)}
                                </span>
                            </div>

                            {/* Messages */}
                            {msgs.map((m, i) => (
                                <div key={i} className={`my-2 max-w-[65%] w-fit ${m.sender_is_admin ? "ml-auto" : "mr-auto"}`}>
                                    <div
                                        className={`px-4 py-2 rounded-2xl text-sm shadow relative ${m.sender_is_admin
                                            ? "bg-green-600 text-white"
                                            : "bg-white"
                                            }`}
                                    >
                                        <p>{m.message}</p>

                                    </div>
                                    {/* Time */}
                                    < span
                                        className={`block text-[10px] mt-1 text-right text-gray-500`}
                                    >
                                        {formatTime(m.timestamp)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {
                    selectedUser && (
                        <div className="sticky bottom-0 bg-white border-t p-3 flex gap-2">
                            <input
                                className="flex-1 rounded-xl border px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-green-600 text-white px-5 rounded-xl hover:bg-green-700 transition"
                            >
                                Send
                            </button>
                        </div>
                    )
                }
            </section >
        </div >
    );
}
