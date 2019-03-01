const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const permissionsController = require("../controllers/permissions");

router.post("/", checkAuth, permissionsController.post);

router.get("/", checkAuth, permissionsController.get);

module.exports = router;
