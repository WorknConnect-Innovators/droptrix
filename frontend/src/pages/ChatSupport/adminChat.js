import React, { useEffect, useRef, useState } from "react";

export default function AdminChat() {
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const user = localStorage.getItem("userData");

    const ADMIN_USERNAME = JSON.parse(user)?.username;

    console.log(ADMIN_USERNAME)

    const [users, setUsers] = useState({});
    const [allMessages, setAllMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [input, setInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!ADMIN_USERNAME) return;

        ws.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/admin/?username=${ADMIN_USERNAME}`
        );

        ws.current.onopen = () => {
            setIsConnected(true);
            console.log("Admin WebSocket connected");
        };

        ws.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("Received:", data);

            // Handle presence updates
            if (data.status) {
                setUsers(prev => ({
                    ...prev,
                    [data.username]: { lastMessage: prev[data.username]?.lastMessage || "", status: data.status }
                }));
                return;
            }

            // Handle chat messages
            if (data.type === "chat.message") {
                // Determine which user this message is associated with
                const chatUser = data.sender_is_admin
                    ? data.target_username  // Admin sent to this user
                    : data.sender;           // User sent the message

                // Update user list with last message
                setUsers(prev => ({
                    ...prev,
                    [chatUser]: {
                        lastMessage: data.message,
                        status: prev[chatUser]?.status || "online"
                    }
                }));

                // Add message to all messages
                setAllMessages(prev => [...prev, {
                    message: data.message,
                    sender: data.sender,
                    sender_is_admin: data.sender_is_admin,
                    chatUser: chatUser,
                    timestamp: data.timestamp
                }]);
            }
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            console.log("Admin WebSocket disconnected");
        };

        return () => ws.current?.close();
    }, [ADMIN_USERNAME]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages, selectedUser]);

    // Load all chat rooms and messages on mount
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/admin/chats/")
            .then(res => res.json())
            .then(data => {
                if (data.chats) {
                    const usersData = {};
                    const messages = [];

                    data.chats.forEach(chat => {
                        const username = chat.user_username;
                        const chatMessages = chat.messages || [];

                        if (chatMessages.length > 0) {
                            const lastMsg = chatMessages[chatMessages.length - 1];
                            usersData[username] = {
                                lastMessage: lastMsg.text,
                                status: "offline"
                            };

                            // Add all messages to the messages array
                            chatMessages.forEach(msg => {
                                messages.push({
                                    message: msg.text,
                                    sender: msg.sender_username,
                                    sender_is_admin: msg.sender_username === ADMIN_USERNAME,
                                    chatUser: username,
                                    timestamp: msg.timestamp
                                });
                            });
                        } else {
                            usersData[username] = { lastMessage: "", status: "offline" };
                        }
                    });

                    setUsers(usersData);
                    setAllMessages(messages);
                }
            })
            .catch(err => console.error("Failed to load chats:", err));
    }, [ADMIN_USERNAME]);

    const sendMessage = () => {
        if (!input.trim() || !selectedUser || !isConnected) return;

        ws.current.send(JSON.stringify({
            message: input,
            target_username: selectedUser
        }));

        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const selectedUserMessages = allMessages.filter(m => m.chatUser === selectedUser);

    return (
        <div className="grid grid-cols-4 h-screen">
            {/* User List Sidebar */}
            <div className="bg-gray-100 p-4 border-r overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Users</h2>
                    <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
                {Object.keys(users).length === 0 ? (
                    <p className="text-gray-500 text-sm">No conversations yet</p>
                ) : (
                    Object.keys(users).map(u => (
                        <div
                            key={u}
                            onClick={() => setSelectedUser(u)}
                            className={`p-3 mb-2 cursor-pointer rounded-xl transition-all ${selectedUser === u ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                                }`}
                        >
                            <div className="font-semibold">{u}</div>
                            <div className={`text-sm truncate ${selectedUser === u ? 'opacity-90' : 'opacity-70'}`}>
                                {users[u].lastMessage || "No messages"}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Area */}
            <div className="col-span-3 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b font-bold bg-white shadow-sm">
                    {selectedUser ? `Chat with ${selectedUser}` : "Select a user to start chatting"}
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {!selectedUser ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>Select a conversation from the sidebar</p>
                        </div>
                    ) : selectedUserMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        selectedUserMessages.map((m, i) => (
                            <div
                                key={i}
                                className={`p-3 my-2 max-w-[70%] rounded-xl ${m.sender_is_admin
                                        ? "bg-green-600 text-white ml-auto"
                                        : "bg-gray-300"
                                    }`}
                            >
                                {m.message}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {selectedUser && (
                    <div className="p-3 border-t flex gap-2 bg-white">
                        <input
                            className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            disabled={!isConnected}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!isConnected || !input.trim()}
                            className={`px-4 rounded-xl ${isConnected && input.trim()
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}