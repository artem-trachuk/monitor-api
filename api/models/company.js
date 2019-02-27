const mongoose = require("mongoose");

const Hub = require("./hub").Hub;
const Contact = require("./contact").contact;
const Permission = require("./permission").permission;

const path = require("../routes/file-path").path;
const removeFiles = require("../fshelper").removeFiles;

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  address: String,
  note: String,
  LatLng: {
    type: {
      lat: Number,
      lng: Number
    }
  },
  phone: String,
  email: String,
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
  },
  logo: {
    path: String,
    filename: String
  }
});

companySchema.pre("remove", function(next) {
  const id = this._doc._id;
  const photos = this._doc.photos;
  const documents = this._doc.documents;
  removeFiles(photos.map(p => path.photos + p.filename));
  removeFiles(documents.map(p => path.documents + p.filename));
  Hub.find({ company: id })
    .then(hubs => {
      return hubs.forEach(hub => hub.remove());
    })
    .then(removeResult => {
      return Contact.find({ company: id });
    })
    .then(contacts => {
      return contacts.forEach(contact => contact.remove());
    })
    .then(removeResult => {
      return Permission.deleteMany({ company: id });
    })
    .then(removeResult => next());
});

companySchema.virtual("hubs", {
  ref: "Hub",
  localField: "_id",
  foreignField: "company",
  justOne: false
});

companySchema.virtual("contacts", {
  ref: "Contact",
  localField: "_id",
  foreignField: "company",
  justOne: false
});

module.exports.company = mongoose.model("Company", companySchema);
