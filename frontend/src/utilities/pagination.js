import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
    totalPages,
    currentPage,
    onPageChange,
    className = "",
}) {
    const [pageLimit, setPageLimit] = useState(1);

    // 🔹 Responsive page limit
    useEffect(() => {
        const updateLimit = () => {
            const w = window.innerWidth;
            if (w >= 1280) setPageLimit(8);      // xl
            else if (w >= 1024) setPageLimit(4); // lg
            else if (w >= 768) setPageLimit(2);  // md
            else setPageLimit(1);                // sm & xs
        };

        updateLimit();
        window.addEventListener("resize", updateLimit);
        return () => window.removeEventListener("resize", updateLimit);
    }, []);

    if (totalPages <= 1) return null;

    // 🔹 Calculate visible pages
    const getVisiblePages = () => {
        if (totalPages <= pageLimit) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(pageLimit / 2);
        let start = currentPage - half;
        let end = currentPage + half;

        if (start < 1) {
            start = 1;
            end = pageLimit;
        }

        if (end > totalPages) {
            end = totalPages;
            start = totalPages - pageLimit + 1;
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const pages = getVisiblePages();
    const isMobile = pageLimit === 1;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* ◀️ Prev */}
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 
               disabled:opacity-40 hover:bg-gray-100 transition"
            >
                <ChevronLeft size={18} />
            </button>

            {/* Pages */}
            <div className="flex items-center gap-1">
                {isMobile ? (
                    // 📱 Mobile: ONLY current page
                    <PageButton active>{currentPage}</PageButton>
                ) : (
                    <>
                        {/* First page + dots */}
                        {pages[0] > 1 && (
                            <>
                                <PageButton
                                    active={currentPage === 1}
                                    onClick={() => onPageChange(1)}
                                >
                                    1
                                </PageButton>
                                <Ellipsis />
                            </>
                        )}

                        {/* Visible pages */}
                        {pages.map((num) => (
                            <PageButton
                                key={num}
                                active={currentPage === num}
                                onClick={() => onPageChange(num)}
                            >
                                {num}
                            </PageButton>
                        ))}

                        {/* Last page + dots */}
                        {pages[pages.length - 1] < totalPages && (
                            <>
                                <Ellipsis />
                                <PageButton
                                    active={currentPage === totalPages}
                                    onClick={() => onPageChange(totalPages)}
                                >
                                    {totalPages}
                                </PageButton>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* ▶️ Next */}
            <button
                disabled={currentPage === totalPages}
                onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                }
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 
               disabled:opacity-40 hover:bg-gray-100 transition"
            >
                <ChevronRight size={18} />
            </button>
        </div>

    );
}

/* 🔹 Small sub-components */
function PageButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm transition
        ${active
                    ? "bg-indigo-100 text-indigo-600 border-indigo-300"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
        >
            {children}
        </button>
    );
}

function Ellipsis() {
    return <span className="px-1 text-gray-400">…</span>;
}
