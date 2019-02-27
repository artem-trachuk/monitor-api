const mongoose = require("mongoose");

const path = require("../routes/file-path").path;
const removeFiles = require("../fshelper").removeFiles;

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hub: {
    ref: "Hub",
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  LatLng: {
    type: {
      lat: Number,
      lng: Number
    }
  },
  ip: String,
  deviceType: {
    type: String,
    enum: ["camera", "recorder", "netdev"],
    lowercase: true
  },
  note: String,
  serial: String,
  ptz: Boolean,
  photos: {
    type: [
      {
        path: String,
        originalname: String,
        filename: String
      }
    ]
  },
  documents: {
    type: [
      {
        path: String,
        originalname: String,
        filename: String
      }
    ]
  }
});

deviceSchema.pre("remove", function(next) {
  const photos = this._doc.photos;
  const documents = this._doc.documents;
  removeFiles(photos.map(p => path.photos + p.filename));
  removeFiles(documents.map(p => path.documents + p.filename));
  next();
});

module.exports.device = mongoose.model("Device", deviceSchema);
