// Run this test file: npm test -- tests/services/user.service.test.js
const userModel = require('../../models/user.model');
const userService = require('../../services/user.service');

jest.mock('../../models/user.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
}));

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all users', async () => {
    const users = [{ _id: 'u1', name: 'Alice' }];
    userModel.find.mockResolvedValue(users);

    const result = await userService.getAllUsers();

    expect(userModel.find).toHaveBeenCalled();
    expect(result).toBe(users);
  });

  it('should return a user by id', async () => {
    const user = { _id: 'u1', name: 'Alice' };
    userModel.findById.mockResolvedValue(user);

    const result = await userService.getUserById('u1');

    expect(userModel.findById).toHaveBeenCalledWith('u1');
    expect(result).toBe(user);
  });
});
