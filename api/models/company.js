const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
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
      },
      logo: String
    }
);

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
