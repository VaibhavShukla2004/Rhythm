// Run this test file: npm test -- tests/services/ai.service.test.js
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({ text: 'mock response' })
    }
  }))
}), { virtual: true });

const { generatePayload } = require('../../services/ai.service');

describe('ai.service', () => {
  it('should include the instruction and hint in generated payload', () => {
    const payload = generatePayload('Custom prompt', 'Some lyrics', 'Make it funny');

    expect(payload.prompt).toContain('You are supposed to modify the lyrics as per the hint specified and return them.');
    expect(payload.prompt).toContain('Custom prompt');
    expect(payload.prompt).toContain('Hint:');
    expect(payload.prompt).toContain('Some lyrics');
  });
});
