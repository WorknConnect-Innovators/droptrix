import { Info, MessageCircleOff } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { MdOutlineSupportAgent } from "react-icons/md";

export default function UserChat() {
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const receivedIds = useRef(new Set());

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ---------------- USER ---------------- */
    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const parsed = JSON.parse(userData);
            setUsername(parsed.username);
        }
    }, []);

    /* ---------------- LOAD HISTORY ---------------- */
    useEffect(() => {
        if (!username) return;

        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData?.id) return;

        setLoading(false);

        fetch(`${process.env.REACT_APP_API_URL}/api/chat/${userData.id}/`)
            .then(res => res.json())
            .then(data => {
                if (data.messages) {
                    const formatted = data.messages.map(m => ({
                        id: m.message_id,
                        message: m.text,
                        sender: m.sender_username,
                        timestamp: m.timestamp
                    }));

                    formatted.forEach(m => receivedIds.current.add(m.id));
                    setMessages(formatted);
                }
            })
            .catch(err => console.error("Chat history error", err))
            .finally(() => setLoading(false));
    }, [username]);

    /* ---------------- WEBSOCKET ---------------- */
    useEffect(() => {
        if (!username) return;

        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${username}/`);

        ws.current.onopen = () => setIsConnected(true);

        ws.current.onmessage = e => {
            const data = JSON.parse(e.data);

            // Deduplicate
            if (data.message_id && receivedIds.current.has(data.message_id)) return;
            if (data.message_id) receivedIds.current.add(data.message_id);

            setMessages(prev => [
                ...prev.filter(m => !m.temp_id || m.message !== data.message),
                {
                    id: data.message_id,
                    message: data.message,
                    sender: data.sender,
                    timestamp: data.timestamp || new Date().toISOString()
                }
            ]);
        };

        ws.current.onclose = () => setIsConnected(false);
        ws.current.onerror = e => console.error("WS error", e);

        return () => ws.current?.close();
    }, [username]);

    /* ---------------- SCROLL ---------------- */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* ---------------- SEND ---------------- */
    const sendMessage = () => {
        if (!input.trim() || !isConnected) return;

        const tempId = Date.now();

        setMessages(prev => [
            ...prev,
            {
                temp_id: tempId,
                message: input,
                sender: username,
                timestamp: new Date().toISOString()
            }
        ]);

        ws.current.send(JSON.stringify({ message: input }));
        setInput("");
    };

    /* ---------------- DATE GROUPING ---------------- */
    const groupedMessages = useMemo(() => {
        const groups = {};

        messages.forEach(msg => {
            const date = new Date(msg.timestamp || Date.now()).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });

        return groups;
    }, [messages]);

    const formatDateLabel = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (dateStr === today) return "Today";
        if (dateStr === yesterday) return "Yesterday";
        return date.toLocaleDateString();
    };

    return (
        <div className="w-full">
            <div className="w-full h-[calc(100vh-8rem)] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow">
                    <span className="text-xl font-semibold">Chat Support</span>
                    <div className="flex items-center gap-x-1">
                        <span className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <p className={`${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                            {isConnected ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">

                    {loading && (
                        <div className="flex justify-center text-gray-400">Loading chat...</div>
                    )}

                    {!loading && Object.keys(groupedMessages).length === 0 && (
                        <div className="flex flex-col justify-center items-center w-full h-full gap-4">
                            {isConnected ? <MdOutlineSupportAgent size={50} className="opacity-60" /> : <MessageCircleOff size={50} className="opacity-60" />}
                            <p className="text-gray-400">
                                {isConnected ? "Start your conversation" : "Support is offline"}
                            </p>
                        </div>
                    )}

                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="text-center text-xs text-gray-400 my-4">
                                {formatDateLabel(date)}
                            </div>

                            {msgs.map((msg) => {
                                const isMe = msg.sender === username;

                                return (
                                    <div
                                        key={msg.id || msg.temp_id}
                                        className={`flex flex-col mb-3 max-w-[75%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"
                                            }`}
                                    >
                                        {/* Message bubble */}
                                        <div
                                            className={`px-3 py-2 rounded-xl text-sm w-fit break-words ${isMe
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-900"
                                                }`}
                                        >
                                            {msg.message}
                                        </div>

                                        {/* Timestamp */}
                                        <span
                                            className={`mt-1 text-[10px] opacity-70 ${isMe ? "text-right" : "text-left"
                                                }`}
                                        >
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {(!isConnected && Object.keys(groupedMessages).length !== 0) && (
                        <div className="flex w-full justify-center items-center">
                            <p className="bg-blue-50 rounded-md px-4 py-1 w-fit text-gray-500 text-sm">Sorry! we are unavailable now</p>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-white flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        disabled={!isConnected}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border rounded-xl"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || !isConnected}
                        className="px-5 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
