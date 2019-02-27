const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  open: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  },
  hub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hub"
  },
  edited: {
    type: Date
  },
  replies: [
    new mongoose.Schema({
      reply: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      edited: {
        type: Date
      }
    })
  ]
});

module.exports.Issue = mongoose.model("Issue", issueSchema);
