export const getCarriersFromBackend = async () => {
    try {
        const res = await fetch(
            `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-carriers/`
        );
        const data = await res.json();

        if (data.status === "success") {
            const finalRes = data?.data;
            return finalRes;
        } else {
            console.error("Invalid data structure:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching carriers:", error);
        return [];
    }
};