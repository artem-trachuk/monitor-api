const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const devicesController = require("../controllers/devices");
const path = require("./file-path").path;

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (file.fieldname === "photos") {
      cb(null, path.photos);
    } else {
      cb(null, path.documents);
    }
  },
  filename: function(req, file, cb) {
    if (file.fieldname === "photos") {
      cb(null, Date.now() + "_" + file.originalname);
    } else {
      cb(null, Date.now() + "_" + file.originalname);
    }
  }
});
const upload = multer({
  storage: storage
});

router.post(
  "/",
  checkAuth,
  upload.fields([{ name: "photos" }, { name: "documents", maxCount: 4 }]),
  devicesController.post
);

// GET by ID
router.get("/:id", checkAuth, devicesController.getById);

router.patch(
  "/:id",
  checkAuth,
  upload.fields([{ name: "photos" }, { name: "documents", maxCount: 4 }]),
  devicesController.patchById
);

module.exports = router;
