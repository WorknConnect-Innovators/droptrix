import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";

function AdminCarrierPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [carriers, setCarriers] = useState([]);
    const [newCarrier, setNewCarrier] = useState({
        name: "",
        description: "",
        logo: "",
    });

    // ✅ Fetch Carriers from Backend
    const getCarriersFromBackend = async () => {
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-carriers/`
            );
            const data = await res.json();
            console.log("Fetched carriers:", data);

            if (data.status === "success") {
                setCarriers(data?.data);
            } else {
                console.error("Invalid data structure:", data);
                setCarriers([]); // fallback
            }
        } catch (error) {
            console.error("Error fetching carriers:", error);
            setCarriers([]); // fallback in case of error
        }
    };

    useEffect(() => {
        getCarriersFromBackend();
    }, []);

    // ✅ Cloudinary Upload Function
    const handleCloudinaryUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "droptrixCarrierLogos");

        setUploading(true);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/dyodgkvkr/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            const data = await res.json();
            console.log("Cloudinary upload successful:", data.secure_url);
            setUploading(false);
            return data.secure_url || null;
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            setUploading(false);
            return null;
        }
    };

    // ✅ Add Carrier Function
    const handleAddCarrier = async () => {
        if (!newCarrier.name || !newCarrier.description || !newCarrier.logo) {
            alert("Please fill all fields before adding a carrier.");
            return;
        }

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL_PRODUCTION}/api/add-carriers/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: newCarrier.name,
                        description: newCarrier.description,
                        logo_url: newCarrier.logo,
                    }),
                }
            );

            const result = await res.json();

            if (result.status === "success") {
                setCarriers((prev) => [
                    ...prev,
                    { ...newCarrier, id: prev.length + 1 },
                ]);
                setShowModal(false);
                setNewCarrier({ name: "", description: "", logo: "" });
            } else {
                alert("Failed to add carrier: " + result.message);
            }
        } catch (err) {
            console.error("Backend error:", err);
        }
    };

    // ✅ File Change Handler
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadedUrl = await handleCloudinaryUpload(file);
        if (uploadedUrl) {
            setNewCarrier((prev) => ({ ...prev, logo: uploadedUrl }));
        }
    };

    // ✅ Delete Carrier (frontend only)
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this carrier?")) {
            setCarriers((prev) => prev.filter((c) => c.id !== id));
        }
    };

    // ✅ Defensive filter
    const filteredCarriers = Array.isArray(carriers)
        ? carriers.filter((c) =>
            c.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Manage Carriers
                </h1>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search carrier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> Add Carrier
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
                        {filteredCarriers.length > 0 ? (
                            filteredCarriers.map((carrier) => (
                                <tr
                                    key={carrier.id || carrier.name}
                                    className="border-t hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-3">
                                        <img
                                            src={carrier.logo || carrier.logo_url}
                                            alt={carrier.name}
                                            className="h-10 w-10 object-cover rounded-full"
                                        />
                                    </td>
                                    <td className="px-6 py-3 font-medium">{carrier.name}</td>
                                    <td className="px-6 py-3">{carrier.description}</td>
                                    <td className="px-6 py-3 flex justify-center gap-3">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(carrier.id)}
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
                                    No carriers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
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
                            Add New Carrier
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Carrier Name
                                </label>
                                <input
                                    type="text"
                                    value={newCarrier.name}
                                    onChange={(e) =>
                                        setNewCarrier((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter carrier name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newCarrier.description}
                                    onChange={(e) =>
                                        setNewCarrier((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter carrier description"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Carrier Logo
                                </label>

                                {uploading ? (
                                    <p className="text-blue-500 text-sm italic">Uploading...</p>
                                ) : newCarrier.logo ? (
                                    <img
                                        src={newCarrier.logo}
                                        alt="preview"
                                        className="h-16 w-16 object-cover rounded-full mb-2"
                                    />
                                ) : null}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="text-sm text-gray-600"
                                />
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
                                onClick={handleAddCarrier}
                                disabled={uploading}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                            >
                                Add Carrier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCarrierPage;
