// Run this test file: npm test -- tests/controllers/user.controller.test.js
const userService = require("../../services/user.service");
const { getUsers, getUserById } = require("../../controllers/user.controller");

jest.mock("../../services/user.service");

describe("user.controller", () => {
  it("should return a list of users", async () => {
    const req = {};
    const res = { json: jest.fn() };

    userService.getAllUsers.mockResolvedValue([{ email: "a@example.com" }]);

    await getUsers(req, res);

    expect(res.json).toHaveBeenCalledWith([{ email: "a@example.com" }]);
  });

  it("should return 404 when user is not found", async () => {
    const req = { params: { id: "nonexistent" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userService.getUserById.mockResolvedValue(null);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});
