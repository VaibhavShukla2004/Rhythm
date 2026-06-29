// Run this test file: npm test -- tests/services/game.service.test.js
const Game = require('../../models/game.model');
const { getUnsyncedLyrics } = require('../../services/song.service');
const { generatePayload, getAIResponse } = require('../../services/ai.service');
const gameService = require('../../services/game.service');

jest.mock('../../models/game.model', () => ({
  create: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../../services/song.service', () => ({
  getUnsyncedLyrics: jest.fn(),
}));

jest.mock('../../services/ai.service', () => ({
  generatePayload: jest.fn(),
  getAIResponse: jest.fn(),
}));

describe('game.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new game with room player and stats mapping', async () => {
    const room = {
      _id: 'roomId',
      _roomCode: 'ABC123',
      players: [
        { userId: 'player1' },
        { userId: 'player2' },
      ],
    };

    const createdGame = { roomId: room._id, roomCode: room._roomCode };
    Game.create.mockResolvedValue(createdGame);

    const result = await gameService.startGame(room);

    expect(Game.create).toHaveBeenCalledWith({
      roomId: room._id,
      roomCode: room._roomCode,
      gameState: 'in-progress',
      roundNumber: 0,
      currentTurnIndex: 0,
      players: [{ playerId: 'player1' }, { playerId: 'player2' }],
      stats: [{ playerId: 'player1' }, { playerId: 'player2' }],
    });
    expect(result).toBe(createdGame);
  });

  it('should start a turn when the game is in progress', async () => {
    const game = {
      gameState: 'in-progress',
      currentTurnIndex: 0,
      players: [{ state: 'stand-by' }],
      pendingTurn: {},
      save: jest.fn(),
    };

    Game.findById.mockResolvedValue(game);

    const result = await gameService.startTurn('gameId');

    expect(Game.findById).toHaveBeenCalledWith('gameId');
    expect(result).toBe(game);
    expect(game.players[0].state).toBe('choosing-song');
    expect(game.pendingTurn.startedAt).toBeInstanceOf(Date);
    expect(game.save).toHaveBeenCalled();
  });

  it('should throw when submitting a song from a non-chooser', async () => {
    const game = {
      currentTurnIndex: 0,
      players: [{ playerId: 'chooser', state: 'choosing-song' }],
      pendingTurn: {},
    };

    Game.findById.mockResolvedValue(game);

    await expect(
      gameService.submitSong('gameId', 'otherPlayer', 'Hello', 'Adele')
    ).rejects.toThrow('Only current chooser can submit song');
  });

  it('should fetch lyrics from the lyrics service', async () => {
    getUnsyncedLyrics.mockResolvedValue('some lyrics');

    const result = await gameService.fetchLyrics('Hello', 'Adele');

    expect(getUnsyncedLyrics).toHaveBeenCalledWith('Hello', 'Adele');
    expect(result).toBe('some lyrics');
  });

  it('should throw a user-facing error when AI response generation fails', async () => {
    generatePayload.mockResolvedValue({});
    getAIResponse.mockRejectedValue(new Error('api failure'));

    await expect(
      gameService.generateAiHint('lyrics', 'hint')
    ).rejects.toThrow('error in aiReponse');
  });
});
