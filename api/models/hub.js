const mongoose = require("mongoose");

const Issue = require("./issue").Issue;
const Device = require("./device").device;

const path = require("../routes/file-path").path;
const removeFiles = require("../fshelper").removeFiles;

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

hubSchema.pre("remove", function(next) {
  const id = this._doc._id;
  const photos = this._doc.photos;
  const documents = this._doc.documents;
  removeFiles(photos.map(p => path.photos + p.filename));
  removeFiles(documents.map(p => path.documents + p.filename));
  Issue.deleteMany({ hub: id })
    .then(issueResult => Device.find({ hub: id }))
    .then(devices => {
      return devices.forEach(device => device.remove());
    })
    .then(deviceResult => next())
    .catch(error => {});
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
