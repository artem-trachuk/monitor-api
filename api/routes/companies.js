const express = require("express");
const router = express.Router();
const companiesController = require("../controllers/companies");
const checkAuth = require("../middleware/check-auth");
const path = require("./file-path").path;

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (file.fieldname === "photos") {
      cb(null, path.photos);
    } else if (file.fieldname === "logo") {
      cb(null, path.logo);
    } else {
      cb(null, path.documents);
    }
  },
  filename: function(req, file, cb) {
    if (file.fieldname === "photos") {
      cb(null, Date.now() + "_" + file.originalname);
    } else if (file.fieldname === "logo") {
      cb(null, Date.now() + "_" + file.originalname);
    } else {
      cb(null, Date.now() + "_" + file.originalname);
    }
  }
});
const upload = multer({
  storage: storage
});

// POST company
router.post(
  "/",
  checkAuth,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "photos" },
    { name: "documents", maxCount: 4 }
  ]),
  companiesController.createCompany,
  companiesController.setPermissions
);

// GET all available companies
router.get("/", checkAuth, companiesController.get);

// GET company by Id
router.get("/:id", checkAuth, companiesController.getById);

// TODO Check user privileges before files uploading
// PATCH company by id
router.patch(
  "/:id",
  checkAuth,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "photos" },
    { name: "documents", maxCount: 4 }
  ]),
  companiesController.patchById
);

module.exports = router;
