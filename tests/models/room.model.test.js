const mongoose = require("mongoose");
const Room = require("../../models/room.model");

describe("room.model", () => {
  it("should define room schema with required fields", () => {
    const schemaPaths = Room.schema.paths;

    expect(schemaPaths.roomCode.options.required).toBe(true);
    expect(schemaPaths.hostId.options.required).toBe(true);
    expect(schemaPaths.maxPlayers.options.required).toBe(true);
    expect(schemaPaths.expiresAt.options.required).toBe(true);
  });
});
