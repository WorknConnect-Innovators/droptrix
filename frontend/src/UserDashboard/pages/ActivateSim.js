import React, { useEffect, useState } from "react";
import { Search, Edit2, Trash2, Plus, DeleteIcon } from "lucide-react";
import { getCarriersFromBackend } from "../../utilities/getCarriers";

function ActivateSim() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddingSim, setIsAddingSim] = useState(false);
    const [carriers, setCarriers] = useState([]);
    const [selectedCarrier, setSelectedCarrier] = useState(null);
    useEffect(() => {
        const fetchCarriers = async () => {
            const response = await getCarriersFromBackend();
            setCarriers(response);
        };
        fetchCarriers();
    }, []);

    // ✅ Dummy SIM Data (Replace with backend later)
    const [sims, setSims] = useState([
        {
            id: 1,
            simNumber: "923001112233",
            carrier: "Telenor",
            status: "Active",
            country: "Pakistan",
        },
        {
            id: 2,
            simNumber: "447700900123",
            carrier: "Vodafone UK",
            status: "Inactive",
            country: "United Kingdom",
        },
        {
            id: 3,
            simNumber: "971500123456",
            carrier: "Etisalat",
            status: "Active",
            country: "UAE",
        },
    ]);

    const handleSelect = (carrier) => {
        setSelectedCarrier(carrier.company_id);
    };

    // 🔍 Search Filter
    const filteredSims = sims.filter((sim) =>
        sim.simNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ❌ Delete SIM
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this SIM?")) {
            setSims((prev) => prev.filter((sim) => sim.id !== id));
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Activate SIM</h1>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search SIM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {isAddingSim ? (
                        <button
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 
                        rounded-lg hover:bg-blue-700 transition"
                            onClick={() => setIsAddingSim(false)}
                        >
                            <DeleteIcon size={18} /> Cancel
                        </button>
                    ) : (
                        <button
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 
                        rounded-lg hover:bg-blue-700 transition"
                            onClick={() => setIsAddingSim(true)}
                        >
                            <Plus size={18} /> Activate Sim
                        </button>
                    )}
                </div>
            </div>

            {isAddingSim ? (
                <div>
                    <label className="text-lg font-medium mb-2 block">Choose Your Carrier</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 mb-8">
                        {carriers.map((carrier, index) => {
                            const isSelected = selectedCarrier === carrier.company_id;
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(carrier)}
                                    className={`border p-4 rounded-lg shadow transition cursor-pointer 
              ${isSelected
                                            ? "border-blue-500 ring-2 ring-blue-300 bg-blue-50"
                                            : "hover:shadow-lg"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="carrier"
                                        checked={isSelected}
                                        onChange={() => handleSelect(carrier)}
                                        className="hidden"
                                    />
                                    <img
                                        src={carrier.logo_url}
                                        alt={carrier.name}
                                        className="w-full h-20 object-contain mb-4"
                                    />
                                    <h3
                                        className={`text-lg font-medium text-center ${isSelected ? "text-blue-600 font-semibold" : ""
                                            }`}
                                    >
                                        {carrier.name}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                < div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-blue-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 text-left">SIM Number</th>
                                <th className="px-6 py-3 text-left">Carrier</th>
                                <th className="px-6 py-3 text-left">Country</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSims.length > 0 ? (
                                filteredSims.map((sim) => (
                                    <tr
                                        key={sim.id}
                                        className="border-t hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-3 font-medium">{sim.simNumber}</td>
                                        <td className="px-6 py-3">{sim.carrier}</td>
                                        <td className="px-6 py-3">{sim.country}</td>

                                        <td className="px-6 py-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium 
                                            ${sim.status === "Active"
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                {sim.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3 flex justify-center gap-3">
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sim.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-6 text-center text-gray-500 italic"
                                    >
                                        No SIMs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

        </div >
    );
}

export default ActivateSim;
