import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { message, Spin } from "antd";
import DeleteConfirmationModal from "../../../components/deleteModal";

function AdminCarrierPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [carriers, setCarriers] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const defaultFields = {
        emi: true,
        eid: true,
        iccid: true,
        email: true,
        postal_code: true,
        phone_no: true,
        pinCode: true,
    };

    const [esimFields, setEsimFields] = useState(defaultFields);
    const [physicalFields, setPhysicalFields] = useState(defaultFields);

    const [carrierForm, setCarrierForm] = useState({
        name: "",
        description: "",
        logo: "",
    });

    // Fetch carriers
    const getCarriersFromBackend = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/get-carriers/`
            );
            const data = await res.json();

            if (data.status === "success") {
                setCarriers(data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCarriersFromBackend();
    }, []);

    // Upload to cloudinary
    const handleCloudinaryUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "droptrixCarrierLogos");
        setUploading(true);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/dyodgkvkr/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();

            setUploading(false);
            return data.secure_url || null;
        } catch (error) {
            console.error("Cloudinary error:", error);
            setUploading(false);
            return null;
        }
    };

    // Add or Update carrier
    const handleSaveCarrier = async () => {
        setIsSubmitting(true);
        if (!carrierForm.name || !carrierForm.description || !carrierForm.logo) {
            message.error("Please fill all fields.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            company_id: editId,
            name: carrierForm.name,
            description: carrierForm.description,
            logo_url: carrierForm.logo,
            esim_required_fields: Object.keys(esimFields).filter(k => esimFields[k]),
            physical_required_fields: Object.keys(physicalFields).filter(k => physicalFields[k]),
        };

        try {
            let res;
            if (isEditing) {
                // Update
                res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/update-carriers/`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                // Add
                res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/add-carriers/`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            }

            const result = await res.json();

            if (result.status === "success") {
                setShowModal(false);
                setIsEditing(false);
                setEditId(null);
                resetForm();
                getCarriersFromBackend();
            } else {
                message.error("Operation failed: " + result.message);
            }
        } catch (error) {
            message.error("Save error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setCarrierForm({ name: "", description: "", logo: "" });
        setEsimFields(defaultFields);
        setPhysicalFields(defaultFields);
    };

    // Handle logo input
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadedUrl = await handleCloudinaryUpload(file);
        if (uploadedUrl) {
            setCarrierForm((prev) => ({ ...prev, logo: uploadedUrl }));
        }
    };

    // Load data into modal for editing
    const handleEdit = (carrier) => {
        setIsEditing(true);
        setEditId(carrier.company_id);

        setCarrierForm({
            name: carrier.name,
            description: carrier.description,
            logo: carrier.logo_url || carrier.logo,
        });

        // Load required fields
        const loadFields = (keys) => {
            const all = {};
            Object.keys(defaultFields).forEach(k => {
                all[k] = keys?.includes(k);
            });
            return all;
        };

        setEsimFields(loadFields(carrier.esim_required_fields));
        setPhysicalFields(loadFields(carrier.physical_required_fields));

        setShowModal(true);
    };

    const filteredCarriers = carriers.filter((c) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/carrier-delete/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ company_id: deleteId }),
                }
            );
            const result = await res.json();

            if (result.status === "success") {
                message.success("Carrier deleted successfully.");
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                setCarriers((prev) => prev.filter((c) => c.company_id !== deleteId));
            } else {
                message.error("Delete failed: " + result.message);
            }
        } catch (error) {
            message.error("Delete error: " + error.message);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Manage Carriers</h1>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                        />
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setIsEditing(false);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        <Plus size={18} /> Add Carrier
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal ? (
                <div className="w-full p-6 bg-white shadow-md rounded-lg">
                    <div className="space-y-4">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium">Carrier Name</label>
                            <input
                                type="text"
                                value={carrierForm.name}
                                onChange={(e) =>
                                    setCarrierForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <textarea
                                rows={3}
                                value={carrierForm.description}
                                onChange={(e) =>
                                    setCarrierForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                            ></textarea>
                        </div>

                        {/* Logo */}
                        <div>
                            <label className="block text-sm font-medium">Logo</label>

                            {uploading ? (
                                <p className="text-blue-500 text-sm">Uploading...</p>
                            ) : carrierForm.logo ? (
                                <img
                                    src={carrierForm.logo}
                                    alt="preview"
                                    className="h-16 w-16 rounded-full object-cover mb-2"
                                />
                            ) : null}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-sm"
                            />
                        </div>

                        {/* ESIM Required Fields */}
                        <FieldsToggleSection
                            title="E-SIM Required Fields"
                            fields={esimFields}
                            setFields={setEsimFields}
                        />

                        {/* Physical Required Fields */}
                        <FieldsToggleSection
                            title="Physical SIM Required Fields"
                            fields={physicalFields}
                            setFields={setPhysicalFields}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-600"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSaveCarrier}
                            disabled={uploading || isSubmitting}
                            className={`px-5 py-2 bg-blue-600 text-white rounded-lg ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isSubmitting ? "Submitting..." : isEditing ? "Update Carrier" : "Add Carrier"}
                        </button>
                    </div>
                </div>
            ) : (
                // Table
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-blue-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 text-left">Logo</th>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Description</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isloading ? (
                                <tr>
                                    <td colSpan="4">
                                        <div className="w-full h-20 flex justify-center items-center">
                                            <Spin />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCarriers.length ? (
                                filteredCarriers.map((carrier) => (
                                    <tr key={carrier.id} className="border-t hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <img
                                                src={carrier.logo_url || carrier.logo}
                                                className="h-12 w-12 object-contain"
                                                alt="logo"
                                            />
                                        </td>

                                        <td className="px-6 py-3">{carrier.name}</td>
                                        <td className="px-6 py-3">{carrier.description}</td>

                                        <td className="px-6 py-3">
                                            <div className="h-full flex justify-center items-center gap-4">
                                                <button
                                                    onClick={() => handleEdit(carrier)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Edit2 size={18} />
                                                </button>

                                                <button
                                                    onClick={() => { setIsDeleteModalOpen(true); setDeleteId(carrier.company_id); }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-6 text-center text-gray-500">
                                        No carriers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isDeleteModalOpen && (
                <DeleteConfirmationModal
                    message="Are you sure you want to delete this item?"
                    deleteFn={handleDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    isSubmitting={isDeleting}
                />
            )}
        </div>
    );
}

// Reusable Toggle Component
function FieldsToggleSection({ title, fields, setFields }) {
    return (
        <div className="mt-4">
            <h4 className="font-semibold mb-2">{title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.keys(fields).map((key) => (
                    <label key={key} className="flex items-center gap-3 p-2 border rounded-lg">
                        <input
                            type="checkbox"
                            checked={fields[key]}
                            onChange={() =>
                                setFields((prev) => ({ ...prev, [key]: !prev[key] }))
                            }
                            className="sr-only peer"
                        />

                        <span
                            className={`inline-flex items-center w-10 h-6 rounded-full transition-colors ${fields[key] ? "bg-indigo-600" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${fields[key] ? "translate-x-5" : "translate-x-1"
                                    }`}
                            />
                        </span>

                        <span className="text-sm capitalize">
                            {key.replace("_", " ")}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default AdminCarrierPage;
