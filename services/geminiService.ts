import type { InteractionResult } from '../types';
import type { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | undefined;

// This function lazily initializes the AI client.
// It is now async and uses dynamic import to prevent module-load crashes.
async function getAiClient(): Promise<GoogleGenAI> {
    if (!process.env.API_KEY) {
        // This error will now be caught by the try/catch in App.tsx
        throw new Error("API_KEY environment variable is not set.");
    }
    if (!ai) {
        const { GoogleGenAI } = await import('@google/genai');
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}


const buildPrompt = (medications: string, food: string): string => {
    return `
You are an expert Food-Drug Interaction Advisor AI for the Dish & Dose mobile application. Your role is to help users identify, understand, and manage potential interactions between their medications and food/beverages.

## Core Responsibilities:
1. Analyze user queries about specific medications and foods
2. Identify potential food-drug interactions with high accuracy
3. Provide clear, patient-friendly explanations of interaction risks
4. Offer practical recommendations for safe medication use
5. Assess interaction severity levels (Minor, Moderate, Severe)

## Safety Guidelines:
- Always err on the side of caution.
- Recommend consulting healthcare professionals for personalized advice.
- Highlight severe interactions prominently.
- Never minimize risks.
- Acknowledge when information is limited or uncertain.
- If the food or medication is not recognized, state that and recommend consulting a pharmacist.

## User Query:
- Medication(s): ${medications}
- Food/Beverage: ${food}

Based on this query, please analyze the potential interaction and provide your response in the specified structured JSON format. Do not include any markdown formatting like \`\`\`json in your response.
`;
};


export const checkInteraction = async (medications: string, food: string): Promise<InteractionResult> => {
    const prompt = buildPrompt(medications, food);

    try {
        const { Type } = await import('@google/genai');
        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            interactionStatus: {
              type: Type.STRING,
              description: "The overall status of the interaction. Must be one of: 'Safe', 'Caution', 'Warning', 'Dangerous'.",
              enum: ['Safe', 'Caution', 'Warning', 'Dangerous'],
            },
            severityLevel: {
              type: Type.STRING,
              description: "The severity level of the interaction. Must be one of: 'None', 'Minor', 'Moderate', 'Severe'.",
              enum: ['None', 'Minor', 'Moderate', 'Severe'],
            },
            interactionDetails: {
              type: Type.STRING,
              description: "A clear, patient-friendly explanation of what happens when the drug and food are combined and the specific mechanisms. Should be a single paragraph.",
            },
            recommendations: {
              type: Type.STRING,
              description: "Actionable recommendations like timing suggestions, dietary alternatives, and when to consult a healthcare professional. Should be a single paragraph or bulleted list.",
            },
            additionalNotes: {
              type: Type.STRING,
              description: "Any special considerations, related interactions, or other important notes. Can be an empty string or 'None' if not applicable. Should be a single paragraph.",
            },
          },
          required: ['interactionStatus', 'severityLevel', 'interactionDetails', 'recommendations', 'additionalNotes']
        };

        const client = await getAiClient(); // Get the client asynchronously
        
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });
        
        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("The AI advisor returned an empty response. This might happen if the query is unclear. Please try rephrasing.");
        }
        const parsedResult = JSON.parse(jsonText) as InteractionResult;
        
        return parsedResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);

        if (error instanceof SyntaxError) {
            // This catches errors from JSON.parse if the AI returns malformed JSON
            throw new Error("The AI advisor returned a response in an unexpected format. Please try rephrasing your query.");
        }
        
        if (error instanceof Error) {
            // Pass through custom error messages we've already thrown (like empty response)
            if (error.message.includes("returned an empty response")) {
                throw error;
            }
            if (error.message.includes('API_KEY')) {
                 throw new Error("The application is not configured correctly. Please contact support.");
            }
            // For other potential API errors (e.g., network issues, 500s from the API)
            throw new Error("Could not connect to the AI advisor. Please check your internet connection and try again.");
        }
        
        // Fallback for any non-Error objects being thrown
        throw new Error("An unexpected error occurred. Please try again later.");
    }
};
