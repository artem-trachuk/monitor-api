const express = require("express");
const router = express.Router();
const issuesController = require("../controllers/issues");
const checkAuth = require("../middleware/check-auth");

router.post("/", checkAuth, issuesController.post);

router.get("/", checkAuth, issuesController.get);

router.post("/:id", checkAuth, issuesController.postById);

module.exports = router;
