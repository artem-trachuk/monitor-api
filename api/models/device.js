const mongoose = require("mongoose");

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
        originalname: String
      }
    ]
  },
  documents: {
    type: [
      {
        path: String,
        originalname: String
      }
    ]
  }
});

module.exports.device = mongoose.model("Device", deviceSchema);
