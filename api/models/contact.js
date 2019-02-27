const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  name: { type: String, required: true },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  note: String
});

module.exports.contact = mongoose.model("Contact", contactSchema);
