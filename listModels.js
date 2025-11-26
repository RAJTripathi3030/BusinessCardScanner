const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Key from your service file
const API_KEY = "AIzaSyCWqhw_NDkvxm2N79lPcRKhgnXkV6Q8JOE";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy model to get client
        // Actually, the SDK doesn't expose listModels directly on the client instance easily in all versions,
        // but we can try to use the API directly or check if the SDK supports it.
        // Let's use a direct fetch for certainty to debug the API key permissions/availability.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
