const songService = require('../../services/song.service');
const { getUnsyncedLyrics } = require('../../controllers/song.controller');

jest.mock('../../services/song.service');

describe('song.controller', () => {
  it('should return 400 when track_name or artist_name is missing', async () => {
    const req = { query: { track_name: 'Hello' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getUnsyncedLyrics(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'track name and artist name required' });
  });

  it('should return 404 when lyrics are not found', async () => {
    const req = { query: { track_name: 'Hello', artist_name: 'Adele' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    songService.getUnsyncedLyrics.mockResolvedValue(null);

    await getUnsyncedLyrics(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Lyrics not found' });
  });

  it('should return lyrics when found', async () => {
    const req = { query: { track_name: 'Hello', artist_name: 'Adele' } };
    const res = { json: jest.fn() };

    songService.getUnsyncedLyrics.mockResolvedValue('Some lyrics');

    await getUnsyncedLyrics(req, res);

    expect(res.json).toHaveBeenCalledWith('Some lyrics');
  });
});
