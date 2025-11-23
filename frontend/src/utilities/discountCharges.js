export const loadDiscountCharges = async (username, type) => {
    try {
        const res = await fetch(
            `${process.env.REACT_APP_API_URL_PRODUCTION}/api/get-user-charges-discount/`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username })
            })
        const data = await res.json()
        if (data.status === 'success') {
            const receivedData = data?.data_received || {}

            if (type === 'topup') {
                const result = { charges: Number(receivedData.topup_charges) || '', discount: Number(receivedData.topup_discount) || '' };
                return result;
            }

            if (type === 'recharge') {
                const result = { charges: Number(receivedData.recharge_charges) || '', discount: Number(receivedData.recharge_discount) || '' };
                return result;
            }

            if (type === 'sim_activation') {
                const result = { charges: Number(receivedData.sim_activation_charges) || '', discount: Number(receivedData.sim_activation_discount) || '' };
                return result;
            }
        }

    }
    catch (err) {
        console.error(err);
    }
}