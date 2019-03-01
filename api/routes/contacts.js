const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const contacts = require("../controllers/contacts");

// GET all contacts
router.get("/", checkAuth, contacts.get);

router.get("/:id", checkAuth, contacts.getById);

router.post("/", checkAuth, contacts.post);

router.patch("/:id", checkAuth, contacts.patchById);

router.delete("/:id", checkAuth, contacts.deleteById);

module.exports = router;
