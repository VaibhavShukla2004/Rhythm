const userModel = require('../models/user.model');

exports.getAllUsers = async () => {
  return await userModel.findAllUsers();
};

exports.getUserById = async (id) => {
  return await userModel.findUserById(id);
};