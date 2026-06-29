// Run this test file: npm test -- tests/services/auth.service.test.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../../models/user.model');
const authService = require('../../services/auth.service');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/user.model');

describe('auth.service', () => {
  it('should hash password and create a user', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    userModel.create.mockResolvedValue({ email: 'test@example.com' });

    const result = await authService.register({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test',
      age: 25,
      securityAnswer: 'blue'
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
    expect(result).toEqual({ email: 'test@example.com' });
  });

  it('should return token for valid credentials', async () => {
    userModel.findOne.mockResolvedValue({ _id: 'user123', password: 'hashed' });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token-abc');

    const token = await authService.login('test@example.com', 'Password123!');

    expect(token).toBe('token-abc');
  });

  it('should return null for invalid credentials', async () => {
    userModel.findOne.mockResolvedValue(null);

    const token = await authService.login('bad@example.com', 'wrong');

    expect(token).toBeNull();
  });
});
