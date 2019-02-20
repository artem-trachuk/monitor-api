const express = require("express");
const router = express.Router();
const issuesController = require("../controllers/issues");
const checkAuth = require("../middleware/check-auth");

router.post("/", checkAuth, issuesController.post);

router.get("/", checkAuth, issuesController.get);

router.post("/:id", checkAuth, issuesController.postById);

router.patch("/:id", checkAuth, issuesController.patchById);

router.delete("/:id", checkAuth, issuesController.deleteById);

module.exports = router;
