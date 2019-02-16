const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const hubsController = require("../controllers/hubs");
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

/* POST hub */
router.post(
  "/",
  checkAuth,
  upload.fields([{ name: "photos" }, { name: "documents", maxCount: 4 }]),
  hubsController.post
);

/* PATCH hub by Id */
router.patch(
  "/:id",
  checkAuth,
  upload.fields([{ name: "photos" }, { name: "documents", maxCount: 4 }]),
  hubsController.patchById
);

/* GET hub by Id */
router.get("/:id", checkAuth, hubsController.getById);

module.exports = router;
