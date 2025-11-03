import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";

function AdminCarrierPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [companies, setCompanies] = useState([
        {
            id: 1,
            name: "TechCorp",
            description: "A leading software solutions provider.",
            logo: "https://via.placeholder.com/50",
        },
        {
            id: 2,
            name: "InnovaSoft",
            description: "Innovative IT company with AI products.",
            logo: "https://via.placeholder.com/50",
        },
    ]);

    const [newCompany, setNewCompany] = useState({
        name: "",
        description: "",
        logo: "",
    });

    const handleAddCompany = () => {
        if (!newCompany.name || !newCompany.description || !newCompany.logo) return;
        setCompanies([
            ...companies,
            { ...newCompany, id: companies.length + 1 },
        ]);
        setNewCompany({ name: "", description: "", logo: "" });
        setShowModal(false);
    };

    const handleDelete = (id) => {
        setCompanies(companies.filter((company) => company.id !== id));
    };

    const filteredCompanies = companies.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Manage Companies
                </h1>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> Add Company
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-blue-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">Logo</th>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Description</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.length > 0 ? (
                            filteredCompanies.map((company) => (
                                <tr
                                    key={company.id}
                                    className="border-t hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-3">
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            className="h-10 w-10 object-cover rounded-full"
                                        />
                                    </td>
                                    <td className="px-6 py-3 font-medium">{company.name}</td>
                                    <td className="px-6 py-3">{company.description}</td>
                                    <td className="px-6 py-3 flex justify-center gap-3">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(company.id)}
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
                                    colSpan="4"
                                    className="px-6 py-6 text-center text-gray-500 italic"
                                >
                                    No companies found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Company Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white w-[90%] max-w-lg rounded-2xl shadow-lg p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Add New Company
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={newCompany.name}
                                    onChange={(e) =>
                                        setNewCompany({ ...newCompany, name: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newCompany.description}
                                    onChange={(e) =>
                                        setNewCompany({
                                            ...newCompany,
                                            description: e.target.value,
                                        })
                                    }
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter company description"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Logo URL or Upload
                                </label>
                                <input
                                    type="text"
                                    value={newCompany.logo}
                                    onChange={(e) =>
                                        setNewCompany({ ...newCompany, logo: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Paste image link or upload below"
                                />
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setNewCompany({
                                                ...newCompany,
                                                logo: URL.createObjectURL(e.target.files[0]),
                                            })
                                        }
                                        className="text-sm text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCompany}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Add Company
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCarrierPage;
