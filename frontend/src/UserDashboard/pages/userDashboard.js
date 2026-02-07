import React, { useEffect, useState } from 'react';
import { Plus, Smartphone, Wallet, ShoppingBag, Globe2, CreditCard, ArrowUpRight, AlertTriangle, RefreshCcw, Database } from 'lucide-react';
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Area,
    AreaChart,
    Brush
} from "recharts";
import { Link } from 'react-router-dom';

function UserDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = async () => {
        setLoading(true);
        const username = JSON.parse(localStorage.getItem('userData'))?.username;
        if (!username) return setError("User not found");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user-dashboard-summary/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            if (!res.ok) throw new Error("Failed to fetch data");

            const data = await res.json();
            setDashboardData(data.data_received || null);
        } catch (err) {
            console.error(err);
            setError("Error loading dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) return <div className='flex flex-col w-full h-[80vh] justify-center items-center gap-4'>
        <div className="loader"></div>
        <p className='font-semibold text-gray-300' >Loading dashboard data...</p>
    </div>;
    if (error)
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertTriangle size={48} className="text-red-500 mb-4" />

                <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
                <p className="text-gray-500 mt-1 mb-5 text-sm max-w-sm">
                    {error || "Unexpected error occurred. Please try again."}
                </p>

                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    <RefreshCcw size={18} />
                    Refresh
                </button>
            </div>
        );

    if (!dashboardData)
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Database size={48} className="text-gray-400 mb-4" />

                <h2 className="text-xl font-semibold text-gray-700">No Dashboard Data</h2>
                <p className="text-gray-500 mt-1 mb-5 text-sm max-w-sm">
                    It looks empty here. Try refreshing to load the latest dashboard data.
                </p>

                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <RefreshCcw size={18} />
                    Refresh
                </button>
            </div>
        );

    // Extract values
    const { active_sims_count, available_balance, purchased_plans, topup_history, transaction_history } = dashboardData;

    // Prepare cards
    const cards = [
        {
            title: "Active SIMs",
            amount: `${active_sims_count || 0} SIMs`,
            icon: <Smartphone className="w-7 h-7 text-blue-600" />,
            link: "/dashboard/activate-sim",
            bg: "bg-blue-100"
        },
        {
            title: "Total Balance",
            amount: `$${available_balance || "0.00"}`,
            icon: <Wallet className="w-7 h-7 text-green-600" />,
            link: '/dashboard/add-funds',
            bg: "bg-green-100"
        },
        {
            title: "Recent Plan Purchased",
            amount: purchased_plans?.length > 0 ? purchased_plans[0]?.plan_name : "No Plans",
            icon: <ShoppingBag className="w-7 h-7 text-purple-600" />,
            link: '/dashboard/topup',
            bg: "bg-purple-100"
        },
    ];

    // Prepare balance history chart
    const balanceHistory = topup_history
        ?.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // sort ascending
        .slice(-10) // take last 10 entries
        .map(item => ({
            date: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            balance: Number(item.amount) // or running balance if needed
        })) || [];

    // Prepare transaction messages
    const transactions = transaction_history?.recharge_history?.map((tx) => ({
        id: tx.id,
        desc: tx.status === "Approved"
            ? `Your account credited with $${tx.amount}`
            : tx.status === "Pending" ? `Recharge request of $${tx.amount}`
                : tx.status === 'Canceled' && `Recharge request of $${tx.amount} is cancelled`,
        amount: tx.status === 'Approved' ? `+$${tx.amount}` : `$${tx.amount}`,
        date: new Date(tx.timestamp).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    })) || [];

    const chartData = balanceHistory.map((item, index) => ({
        ...item,
        x: index, // unique X-axis value
    }));

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

                            <Link to={card.link} state={{ fromDashboardAdd: true }} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                                <Plus className="w-5 h-5 text-gray-700" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-4 gap-y-4">

                {/* Left Panel — SIM Actions */}
                <div className="w-full bg-white shadow-lg rounded-2xl p-6 space-y-5 h-full">
                    <h3 className="text-lg font-semibold mb-2">SIM Controls</h3>

                    <div className="space-y-4">
                        <Link to={'/dashboard/activate-sim'} className="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 p-3 rounded-xl transition">
                            <Globe2 className="text-blue-600" />
                            <span className="font-medium text-gray-700">Activate International SIM</span>
                        </Link>
                        <Link to={'/dashboard/add-funds'} className="w-full flex items-center gap-3 bg-green-50 hover:bg-green-100 p-3 rounded-xl transition">
                            <CreditCard className="text-green-600" />
                            <span className="font-medium text-gray-700">Add Balance</span>
                        </Link>
                        <Link to={'/dashboard/topup'} className="w-full flex items-center gap-3 bg-purple-50 hover:bg-purple-100 p-3 rounded-xl transition">
                            <ArrowUpRight className="text-purple-600" />
                            <span className="font-medium text-gray-700">Recharge / Top-up SIM</span>
                        </Link>
                    </div>

                    <div className="mt-8">
                        <h4 className="font-medium text-gray-700 mb-3">Active SIMs</h4>
                        <div className="space-y-3">
                            {dashboardData.active_sims?.length > 0
                                ? dashboardData.active_sims.map((sim, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border flex justify-between items-center">
                                        <span>{sim.phone_no}</span>
                                        <span className={`text-xs px-2 py-1 rounded-lg ${sim.status === "Pending" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                                            {sim.status}
                                        </span>
                                    </div>
                                ))
                                : <div className="text-gray-400 text-sm">No active SIMs</div>
                            }
                        </div>
                    </div>
                </div>

                {/* Center Panel — Balance Chart */}
                <div className="bg-white shadow-lg rounded-2xl col-span-2 h-full">
                    <h2 className="text-xl font-semibold mb-2 text-center border-b py-3">Balance History</h2>
                    <div className="w-full min-h-96 h-full pb-20 pr-5">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                                    <XAxis
                                        dataKey="x"
                                        tickFormatter={(value) => chartData[value]?.date}
                                        stroke="#6b7280"
                                    />

                                    <YAxis stroke="#6b7280" />

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            borderRadius: "8px",
                                            border: "none",
                                            color: "#fff",
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                                        }}
                                        labelFormatter={(value) => chartData[value]?.date}
                                        formatter={(value) => [`$${value}`, "Balance"]}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fill="url(#balanceGradient)"
                                        activeDot={{ r: 6 }}
                                    />

                                    {chartData.length > 7 && (
                                        <Brush
                                            dataKey="x"
                                            height={22}
                                            stroke="#3b82f6"
                                            travellerWidth={10}
                                            tickFormatter={(value) => chartData[value]?.date}
                                        />
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-gray-400 text-center py-20">
                                No balance history available
                            </div>
                        )}
                    </div>


                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

                <div className="space-y-4">
                    {transactions.length > 0 ? transactions.slice(-10).reverse().map(tx => (
                        <div key={tx.id} className="p-4 shadow-sm rounded-xl border flex justify-between items-center hover:bg-gray-50 transition">
                            <div>
                                <div className="font-medium text-gray-800">{tx.desc}</div>
                                <div className="text-xs text-gray-500">{tx.date}</div>
                            </div>
                            <div className={`font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>{tx.amount}</div>
                        </div>
                    )) : <div className="text-gray-400 text-center py-10">No recent activity</div>}
                </div>
            </div>

        </div>
    );
}

export default UserDashboard;
