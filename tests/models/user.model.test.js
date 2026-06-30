const mongoose = require("mongoose");
const User = require("../../models/user.model");

describe("user.model", () => {
  it("should create schema with required fields", () => {
    const schemaPaths = User.schema.paths;

    expect(schemaPaths.email.options.required).toBe(true);
    expect(schemaPaths.password.options.required).toBe(true);
    expect(schemaPaths.name.options.required).toBe(true);
    expect(schemaPaths.age.instance).toBe("Number");
  });
});
