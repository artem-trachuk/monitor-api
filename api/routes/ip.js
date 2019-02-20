const express = require("express");
const router = express.Router();

const ipController = require("../controllers/ip");
const checkAuth = require("../middleware/check-auth");

router.get("/", checkAuth, ipController.get);

module.exports = router;