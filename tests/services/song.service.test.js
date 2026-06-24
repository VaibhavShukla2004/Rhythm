// Run this test file: npm test -- tests/services/song.service.test.js
const mockGetUnsynced = jest.fn();

jest.mock('lrclib-api', () => ({
  Client: jest.fn().mockImplementation(() => ({
    getUnsynced: mockGetUnsynced
  }))
}));

const songService = require('../../services/song.service');

describe('song.service', () => {
  it('should call getUnsynced with track_name and artist_name', async () => {
    mockGetUnsynced.mockResolvedValue('lyrics');

    const result = await songService.getUnsyncedLyrics('Hello', 'Adele');

    expect(mockGetUnsynced).toHaveBeenCalledWith({ track_name: 'Hello', artist_name: 'Adele' });
    expect(result).toBe('lyrics');
  });
});
