const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
// 1. Get a list of all users
router.get("/", userController.getUsers);
// 2. Get a specific user's profile by their ID (e.g., /user/5)
router.get("/:id", userController.getUserById);

module.exports = router;
