const OpenAI = require("openai");

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o";

// Generate a payload for the AI service
const generatePayload = (lyrics, hint) => {
  return {
    systemPrompt: "You are a helpful music hint assistant.",
    userMessage: `Given the lyrics: "${lyrics}" and hint: "${hint}", provide a helpful hint for the user.`
  };
};

// Get AI response from the OpenAI service
const getAIResponse = async (payload) => {
  try {
    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: payload.systemPrompt },
        { role: "user", content: payload.userMessage }
      ],
      model: model
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};

// Generate a payload for the AI service to modify lyrics according to a hint
const generateModifyLyricsPayload = (lyrics, hint) => {
  return {
    systemPrompt: "You are a helpful lyric modification assistant. Your job is to modify the provided song lyrics according to the given hint. Return ONLY the modified lyrics and absolutely nothing else. Do not include conversational filler, notes, or markdown formatting blocks (like ```).",
    userMessage: `Original Lyrics:\n"${lyrics}"\n\nHint:\n"${hint}"`
  };
};

module.exports = {
  generatePayload,
  generateModifyLyricsPayload,
  getAIResponse
};

