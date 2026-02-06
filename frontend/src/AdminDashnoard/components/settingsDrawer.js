function SettingsDrawer({ open, onClose }) {
    return (
        <div
            className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"
                }`}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"
                    }`}
            />

            {/* Drawer */}
            <div
                className={`absolute right-0 top-0 h-full w-[360px] bg-white shadow-2xl transform transition-transform ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-lg">Profile Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    {/* Your profile / settings form here */}
                    Edit Profile Form
                </div>
            </div>
        </div>
    );
}

export default SettingsDrawer;
