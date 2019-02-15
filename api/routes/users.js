const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const checkAuth = require("../middleware/check-auth");

router.get("/", checkAuth, usersController.get);

router.get("/:id", checkAuth, usersController.getById);

module.exports = router;
