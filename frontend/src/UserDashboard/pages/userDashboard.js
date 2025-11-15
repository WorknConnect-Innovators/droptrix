import React from 'react';
import { Plus, Smartphone, Wallet, ShoppingBag, Globe2, CreditCard, ArrowUpRight } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

function UserDashboard() {

    const balanceHistory = [
        { date: "Jan", balance: 3000 },
        { date: "Feb", balance: 3500 },
        { date: "Mar", balance: 2800 },
        { date: "Apr", balance: 4200 },
        { date: "May", balance: 5000 },
        { date: "Jun", balance: 4700 },
    ];

    const cards = [
        {
            title: "Active SIMs",
            amount: "3 SIMs",
            icon: <Smartphone className="w-7 h-7 text-blue-600" />,
            bg: "bg-blue-100"
        },
        {
            title: "Total Balance",
            amount: "$5,000",
            icon: <Wallet className="w-7 h-7 text-green-600" />,
            bg: "bg-green-100"
        },
        {
            title: "Recent Plan Purchased",
            amount: "Weekly Social Pack",
            icon: <ShoppingBag className="w-7 h-7 text-purple-600" />,
            bg: "bg-purple-100"
        },
    ];

    const transactions = [
        { id: 1, desc: "Top-up to UK SIM", amount: "-$10", date: "10 Jun" },
        { id: 2, desc: "Added Balance", amount: "+$50", date: "08 Jun" },
        { id: 3, desc: "Activated UAE SIM", amount: "-$15", date: "05 Jun" },
    ];

    return (
        <div className="space-y-4">

            {/* Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className="rounded-xl shadow-md hover:shadow-xl transition-all border p-5 flex items-center gap-5 bg-white"
                    >
                        <div className={`${card.bg} rounded-xl p-4 flex items-center justify-center`}>
                            {card.icon}
                        </div>

                        <div className="flex justify-between w-full items-center">
                            <div>
                                <div className="text-gray-600 text-sm">{card.title}</div>
                                <div className="text-xl font-semibold">{card.amount}</div>
                            </div>

                            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                                <Plus className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Left Panel — SIM Actions */}
                <div className="bg-white shadow-lg rounded-2xl p-6 space-y-5 h-fit">

                    <h3 className="text-lg font-semibold mb-2">SIM Controls</h3>

                    <div className="space-y-4">

                        <button className="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 p-3 rounded-xl transition">
                            <Globe2 className="text-blue-600" />
                            <span className="font-medium text-gray-700">Activate International SIM</span>
                        </button>

                        <button className="w-full flex items-center gap-3 bg-green-50 hover:bg-green-100 p-3 rounded-xl transition">
                            <CreditCard className="text-green-600" />
                            <span className="font-medium text-gray-700">Add Balance</span>
                        </button>

                        <button className="w-full flex items-center gap-3 bg-purple-50 hover:bg-purple-100 p-3 rounded-xl transition">
                            <ArrowUpRight className="text-purple-600" />
                            <span className="font-medium text-gray-700">Recharge / Top-up SIM</span>
                        </button>

                    </div>

                    <div className="mt-8">
                        <h4 className="font-medium text-gray-700 mb-3">Active SIMs</h4>

                        <div className="space-y-3">
                            <div className="p-3 rounded-lg border flex justify-between items-center">
                                <span>UK SIM</span>
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-lg">Active</span>
                            </div>
                            <div className="p-3 rounded-lg border flex justify-between items-center">
                                <span>UAE SIM</span>
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-lg">Active</span>
                            </div>
                            <div className="p-3 rounded-lg border flex justify-between items-center">
                                <span>Canada SIM</span>
                                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg">Pending</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Center Panel — Balance Chart */}
                <div className="bg-white shadow-lg rounded-2xl p-6 col-span-2 h-full">
                    <h2 className="text-xl font-semibold mb-4">Balance History</h2>
                    <div className="w-full min-h-80 h-full pb-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={balanceHistory}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="date" stroke="#555" />
                                <YAxis stroke="#555" />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: "#4f46e5" }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

                <div className="space-y-4">
                    {transactions.map(tx => (
                        <div key={tx.id} className="p-4 shadow-sm rounded-xl border flex justify-between items-center hover:bg-gray-50 transition">
                            <div>
                                <div className="font-medium text-gray-800">{tx.desc}</div>
                                <div className="text-xs text-gray-500">{tx.date}</div>
                            </div>
                            <div className="font-semibold">{tx.amount}</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default UserDashboard;
