// Run this test file: npm test -- tests/services/room.service.test.js
const Room = require('../../models/room.model');
const gameService = require('../../services/game.service');
const roomService = require('../../services/room.service');

jest.mock('../../models/room.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../services/game.service', () => ({
  startGame: jest.fn(),
}));

describe('room.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a room when parameters are valid', async () => {
    Room.findOne.mockResolvedValue(null);
    const expectedRoom = { roomCode: 'ABC123', hostId: 'hostId', maxPlayers: 5 };
    Room.create.mockResolvedValue(expectedRoom);

    const result = await roomService.createRoom('hostId', 5);

    expect(Room.findOne).toHaveBeenCalled();
    expect(Room.create).toHaveBeenCalledWith(expect.objectContaining({
      roomCode: expect.any(String),
      hostId: 'hostId',
      maxPlayers: 5,
      players: [{ userId: 'hostId' }],
    }));
    expect(result).toBe(expectedRoom);
  });

  it('should throw when requested maxPlayers is invalid', async () => {
    await expect(roomService.createRoom('hostId', 1)).rejects.toThrow('Invalid room size');
    await expect(roomService.createRoom('hostId', 11)).rejects.toThrow('Invalid room size');
  });

  it('should join an existing room when the room is open and user is not already present', async () => {
    const room = {
      players: [{ userId: 'hostId' }],
      maxPlayers: 3,
      gameStatus: 'idle',
      save: jest.fn().mockResolvedValue(true),
    };
    Room.findOne.mockResolvedValue(room);

    const result = await roomService.joinRoom('ABC123', 'guestId');

    expect(Room.findOne).toHaveBeenCalledWith({ roomCode: 'ABC123' });
    expect(room.save).toHaveBeenCalled();
    expect(result.players).toContainEqual({ userId: 'guestId' });
  });

  it('should start a game when the host invokes startGame', async () => {
    const room = {
      hostId: 'hostId',
      gameStatus: 'idle',
      players: [{ userId: 'hostId' }, { userId: 'player2' }],
      save: jest.fn().mockResolvedValue(true),
    };
    Room.findOne.mockResolvedValue(room);
    gameService.startGame.mockResolvedValue({ id: 'gameId' });

    const result = await roomService.startGame('ABC123', 'hostId');

    expect(Room.findOne).toHaveBeenCalledWith({ roomCode: 'ABC123' });
    expect(gameService.startGame).toHaveBeenCalledWith(room);
    expect(room.save).toHaveBeenCalled();
    expect(result).toEqual({ room, game: { id: 'gameId' } });
  });
});
