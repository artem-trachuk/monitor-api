const mongoose = require("mongoose");

const hubSchema = new mongoose.Schema({
  name: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  },
  LatLng: {
    type: {
      lat: Number,
      lng: Number
    }
  },
  note: String,
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

hubSchema.virtual("devices", {
  ref: "Device",
  localField: "_id",
  foreignField: "hub",
  justOne: false
});

hubSchema.virtual("issues", {
  ref: "Issue",
  localField: "_id",
  foreignField: "hub",
  justOne: false
});

module.exports.Hub = mongoose.model("Hub", hubSchema);
