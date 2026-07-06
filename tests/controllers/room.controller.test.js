const roomService = require("../../services/room.service");
const {
  createRoom,
  getRoomDetails,
  joinRoom,
  leaveRoom,
  transferHost,
} = require("../../controllers/room.controller");

jest.mock("../../services/room.service");

describe("room.controller", () => {
  it("should return 201 when a room is created", async () => {
    const req = {
      body: { maxPlayers: 4 },
      user: { userId: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    roomService.createRoom.mockResolvedValue({ roomCode: "ABC123" });

    await createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ roomCode: "ABC123" });
  });

  it("should return room details", async () => {
    const req = { params: { roomCode: "ABC123" } };
    const res = { json: jest.fn() };

    roomService.getRoomDetails.mockResolvedValue({ roomCode: "ABC123" });

    await getRoomDetails(req, res);

    expect(res.json).toHaveBeenCalledWith({ roomCode: "ABC123" });
  });
});
