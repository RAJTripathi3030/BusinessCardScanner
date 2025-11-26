import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from 'expo-file-system/legacy';

// TODO: Replace with your actual API key
const API_KEY = "AIzaSyCWqhw_NDkvxm2N79lPcRKhgnXkV6Q8JOE";

const genAI = new GoogleGenerativeAI(API_KEY);

export const extractBusinessCardInfo = async (imageUri) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        const prompt = `Extract the following information from this business card image and return it as a JSON object:
    - name
    - job_title
    - company
    - email
    - phone
    - website
    - address
    
    If a field is missing, return null for that field. Do not include markdown formatting in the response, just the raw JSON string.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks if Gemini adds them
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error extracting info with Gemini:", error);
        throw error;
    }
};
