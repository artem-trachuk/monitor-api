const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  create: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false
  },
  update: {
    type: Boolean,
    default: false
  },
  delete: {
    type: Boolean,
    default: false
  }
});

module.exports.permission = mongoose.model("Permission", permissionSchema);
