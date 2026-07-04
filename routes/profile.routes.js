const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const profileController = require("../controllers/profile.controller");

router.get("/",authMiddleware,profileController.getProfile);

module.exports = router;