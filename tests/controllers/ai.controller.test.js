const aiService = require('../../services/ai.service');
const { generateHint, modifyLyrics } = require('../../controllers/ai.controller');

jest.mock('../../services/ai.service');

describe('ai.controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('generateHint', () => {
    it('should return 400 when lyrics or hint is missing', async () => {
      req.body = { lyrics: 'some lyrics' }; // hint missing
      await generateHint(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'lyrics and hint required' });

      req.body = { hint: 'some hint' }; // lyrics missing
      await generateHint(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'lyrics and hint required' });
    });

    it('should generate hint successfully', async () => {
      req.body = { lyrics: 'hickory dickory dock', hint: 'make it about food' };
      const mockPayload = { systemPrompt: 'sys', userMessage: 'user' };
      aiService.generatePayload.mockReturnValue(mockPayload);
      aiService.getAIResponse.mockResolvedValue('mocked hint response');

      await generateHint(req, res, next);

      expect(aiService.generatePayload).toHaveBeenCalledWith('hickory dickory dock', 'make it about food');
      expect(aiService.getAIResponse).toHaveBeenCalledWith(mockPayload);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ aiHint: 'mocked hint response' });
    });
  });

  describe('modifyLyrics', () => {
    it('should return 400 when lyrics or hint is missing', async () => {
      req.body = { lyrics: 'some lyrics' }; // hint missing
      await modifyLyrics(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'lyrics and hint required' });

      req.body = { hint: 'some hint' }; // lyrics missing
      await modifyLyrics(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'lyrics and hint required' });
    });

    it('should modify lyrics successfully', async () => {
      req.body = { lyrics: 'hickory dickory dock', hint: 'make it about food' };
      const mockPayload = { systemPrompt: 'sys2', userMessage: 'user2' };
      aiService.generateModifyLyricsPayload.mockReturnValue(mockPayload);
      aiService.getAIResponse.mockResolvedValue('mocked modified lyrics response');

      await modifyLyrics(req, res, next);

      expect(aiService.generateModifyLyricsPayload).toHaveBeenCalledWith('hickory dickory dock', 'make it about food');
      expect(aiService.getAIResponse).toHaveBeenCalledWith(mockPayload);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ modifiedLyrics: 'mocked modified lyrics response' });
    });
  });
});
