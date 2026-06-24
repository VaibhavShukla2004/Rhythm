const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middlewares/auth.middleware');

jest.mock('jsonwebtoken');

describe('auth.middleware', () => {
  it('should return 401 if Authorization header is missing', () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer badtoken' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and attach user when token is valid', () => {
    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = {};
    const next = jest.fn();

    jwt.verify.mockReturnValue({ userId: 'user123' });

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ userId: 'user123' });
    expect(next).toHaveBeenCalled();
  });
});
