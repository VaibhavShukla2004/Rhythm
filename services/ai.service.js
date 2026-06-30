const OpenAI = require("openai");

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o";

// Private helper function (no longer exported)
const generatePayload = (lyrics, hint) => {
  return {
    systemPrompt: `
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
`,
    userMessage: `
Lyrics:
${lyrics}

Hint:
${hint}
`,
  };
};

// Main service function that handles the full workflow
const getModifiedLyrics = async (lyrics, hint) => {
  try {
    const payload = generatePayload(lyrics, hint);

    const client = new OpenAI({
      baseURL: endpoint,
      apiKey: token,
    });

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: payload.systemPrompt,
        },
        {
          role: "user",
          content: payload.userMessage,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    return JSON.parse(response.choices[0].message.content).modifiedLyrics;
  } catch (error) {
    console.error("AI Service Error:", error);
    // You can throw a more generic error here if you want to hide OpenAI specifics from the controller
    throw new Error("Failed to process lyrics through AI service.");
  }
};

module.exports = {
  getModifiedLyrics,
};
