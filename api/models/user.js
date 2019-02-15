const mongoose = require("mongoose");
const ObjectIdType = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  name: String,
  picture: String
});

module.exports.User = mongoose.model("User", userSchema);
