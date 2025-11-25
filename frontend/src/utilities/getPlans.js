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

export const companyBasedPlans = async (companyID) => {
    try {
        const res = await fetch(
            `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-plans/`
        );
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.data)) {
            const activePlans = data.data.filter(plan => plan.live_status === true);
            const plans = activePlans.filter(plan => plan.company_id === companyID);
            return plans;
        } else {
            console.warn("Unexpected response format:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
}

export const getIDBasedPlans = async (planID) => {
    try {
        const res = await fetch(
            `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-plans/`
        );
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.data)) {
            const livePlans = data.data.filter(plan => plan.live_status === true);
            const plan = livePlans.find(plan => plan.plan_id === planID);
            // Filter only live plans
            return plan || null;
        } else {
            console.warn("Unexpected response format:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
};