// Run this test file: npm test -- tests/controllers/auth.controller.test.js
const authService = require("../../services/auth.service");
const { register, login } = require("../../controllers/auth.controller");

jest.mock("../../services/auth.service");

describe("auth.controller", () => {
  it("should return 201 and the created user", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!",
        name: "Test User",
        age: 22,
        securityAnswer: "blue",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    authService.register.mockResolvedValue({ id: "1", email: req.body.email });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "1", email: req.body.email });
  });

  it("should return a token when login succeeds", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    authService.login.mockResolvedValue("token-abc");

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith({ token: "token-abc" });
  });

  it("should return 400 when login fails", async () => {
    const req = {
      body: {
        email: "bad@example.com",
        password: "wrong",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    authService.login.mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password",
    });
  });
});
