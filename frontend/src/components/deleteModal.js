import React from "react";
import { Trash2, X } from "lucide-react";

export default function DeleteConfirmationModal({
    message = "Are you sure you want to delete this item?",
    deleteFn,
    onCancel,
    isSubmitting,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 text-red-600">
                            <Trash2 size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Confirm Delete
                        </h3>
                    </div>

                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-gray-300
              text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={deleteFn}
                        className="px-5 py-2 rounded-xl bg-red-600 text-white
              hover:bg-red-700 active:scale-95 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
