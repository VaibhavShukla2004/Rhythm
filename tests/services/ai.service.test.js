// Run this test file: npm test -- tests/services/ai.service.test.js
jest.mock(
  "@google/genai",
  () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({ text: "mock response" }),
      },
    })),
  }),
  { virtual: true },
);

const {
  generatePayload,
  generateModifyLyricsPayload,
} = require("../../services/ai.service");

describe("ai.service", () => {
  it("should generate payload for hint generation correctly", () => {
    const payload = generatePayload("Some lyrics", "Make it funny");

    expect(payload.systemPrompt).toBe(
      "You are a helpful music hint assistant.",
    );
    expect(payload.userMessage).toContain("Some lyrics");
    expect(payload.userMessage).toContain("Make it funny");
  });

  it("should generate payload for lyric modification correctly", () => {
    const payload = generateModifyLyricsPayload(
      "Some lyrics",
      "make it about food",
    );

    expect(payload.systemPrompt).toContain("lyric modification assistant");
    expect(payload.systemPrompt).toContain("Return ONLY the modified lyrics");
    expect(payload.userMessage).toContain("Some lyrics");
    expect(payload.userMessage).toContain("make it about food");
  });
});
