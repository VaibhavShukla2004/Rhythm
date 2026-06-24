const { logger } = require('../../middlewares/logger.middleware');

describe('logger.middleware', () => {
  it('should log method and url and call next', () => {
    const req = { method: 'GET', url: '/test' };
    const res = {};
    const next = jest.fn();

    global.console = { log: jest.fn() };

    logger(req, res, next);

    expect(console.log).toHaveBeenCalledWith('GET /test');
    expect(next).toHaveBeenCalled();
  });
});
