const userModel = require("../models/user.model");

exports.getAllUsers = async () => {
  return await userModel.find(); //select * from users
};

exports.getUserById = async (id) => {
  return await userModel.findById(id);
};
