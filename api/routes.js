const express = require("express");
const router = express.Router();

const usersRouter = require("./routes/users");
const hubsRouter = require("./routes/hubs");
const companiesRouter = require("./routes/companies");
const devicesRouter = require("./routes/devices");
const authRouter = require("./routes/auth");
const issuesRouter = require("./routes/issues");
const contactsRouter = require("./routes/contacts");
const permissionsRouter = require("./routes/permissions");
const ipRouter = require("./routes/ip");

router.use("/users", usersRouter);
router.use("/hubs", hubsRouter);
router.use("/companies", companiesRouter);
router.use("/networks", companiesRouter);
router.use("/devices", devicesRouter);
router.use("/auth", authRouter);
router.use("/issues", issuesRouter);
router.use("/contacts", contactsRouter);
router.use("/permissions", permissionsRouter);
router.use("/ip", ipRouter);

module.exports = router;
