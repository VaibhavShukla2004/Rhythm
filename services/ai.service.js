const { GoogleGenAI } = require("@google/genai");

//creates gemini client 
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

//generates payload which is the final string to be sent to gemini
function generatePayload(promptTemplate, lyrics, hint) {
    const prompt = `
You are supposed to modify the lyrics as per the hint specified and return them.

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

module.exports = { generatePayload, getAIResponse };
