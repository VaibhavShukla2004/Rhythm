const express = require("express");
const router = express.Router();
// We import the controller, which holds the actual logic
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register); // hitting /register after we are already under /auth
router.post("/login", authController.login);

module.exports = router;

//Spring Boot Equivalent: This routes file acts exactly like the @RequestMapping and @PostMapping annotations at the top of a Spring @RestController.
//so in server.js the app.use('/auth',authRoutes) acts like requestmapping from springboot and then the routes file itself acts like get,post,update and delete mappings,but instead of handling it then and there, the controllers in the route files then handle it from where it goes to service
