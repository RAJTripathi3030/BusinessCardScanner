export const saveToSheet = async (url, data) => {
    if (!url) {
        throw new Error("Google Sheets URL is missing. Please enter it in the app.");
    }
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const text = await response.text();
        console.log("Sheets API Response Status:", response.status);
        console.log("Sheets API Response Body:", text);

        if (!response.ok) {
            throw new Error("Failed to save to Google Sheet: " + text);
        }

        return JSON.parse(text);
    } catch (error) {
        console.error("Error saving to sheet:", error);
        throw error;
    }
};
