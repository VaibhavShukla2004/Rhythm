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


module.exports = {
  generatePayload,
  getAIResponse
};

