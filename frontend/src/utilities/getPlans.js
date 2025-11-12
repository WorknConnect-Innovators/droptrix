// src/utils/apiPlans.js

export const getPlansFromBackend = async () => {
    try {
        const res = await fetch(
            `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-plans/`
        );
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.data)) {
            // Filter only live plans
            return data.data.filter(plan => plan.live_status === true);
        } else {
            console.warn("Unexpected response format:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
};
