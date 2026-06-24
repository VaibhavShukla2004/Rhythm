import { GoogleGenAI } from "@google/genai";
const promptTemplate = `You are modifying song lyrics for a lyrics guessing game.
Rules:
- Rewrite the lyrics according to the user's hint.
- Keep roughly the same rhythm and structure.
- Return ONLY the modified lyrics`;

//creates gemini client 
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

//generates payload which is the final string to be sent to gemini
function generatePayload(lyrics, hint) {
    const prompt = `
${promptTemplate}

Hint:
${hint}

Lyrics:
${lyrics}
`;

    return { prompt };
}


//sends payload to AI and gets AI response
async function getAIResponse(payload) {
    try {
        const response = await client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: payload.prompt
        });

        return response.text;
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
}

