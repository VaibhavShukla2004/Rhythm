const gameService = require('../../services/game.service');
const { callAi } = require('../../controllers/game.controller');

jest.mock('../../services/game.service', () => ({
  generateAiResponse: jest.fn()
}));

describe('game.controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return the AI hint from the service response', async () => {
    gameService.generateAiResponse.mockResolvedValue('mocked ai hint');

    await callAi(req, res, next);

    expect(gameService.generateAiResponse).toHaveBeenCalledWith(
      'Never gonna give you up,never gonna let you down',
      'Exchange the places of up and down in this'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ aiHint: 'mocked ai hint' });
  });
});
