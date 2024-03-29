const { Schema, model } = require("mongoose");

const userDataSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true 
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false // Defaultnya diatur sebagai false
  }
});

module.exports = model("UserData", userDataSchema);