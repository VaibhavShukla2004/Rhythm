const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.AION_API_KEY,
  baseURL: "https://api.aionlabs.ai/v1",
});

const model = "aion-labs/aion-3.0";

// Private helper function
const generatePrompt = (lyrics, hint) => {
  return `
You modify song lyrics for a lyrics guessing game.

Rules:
- Rewrite the lyrics according to the user's hint.
- Keep approximately the same rhythm and sentence structure.
- Only change what is necessary to satisfy the hint.
- Do NOT explain your changes.
- Do NOT include markdown.
- Do NOT wrap the lyrics in quotation marks.
- Return ONLY valid JSON in the following format:

{
  "modifiedLyrics": "<rewritten lyrics>"
}

Example 1

Lyrics:
I fly like paper, get high like planes

Hint:
Make the nouns about money.

Response:
{
  "modifiedLyrics": "I fly like dollars, get high like banks"
}

Example 2

Lyrics:
Hit me baby one more time

Hint:
Make it about food.

Response:
{
  "modifiedLyrics": "Feed me pizza one more time"
}

Lyrics:
${lyrics}

Hint:
${hint}
`;
};

// Main service function
const getModifiedLyrics = async (lyrics, hint) => {
  try {
    const prompt = generatePrompt(lyrics, hint);

    const response = await client.responses.create({
      model: model,
      input: prompt,
    });

    const result = JSON.parse(response.output_text);

    return result.modifiedLyrics;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to process lyrics through AI service.");
  }
};

module.exports = {
  getModifiedLyrics,
};