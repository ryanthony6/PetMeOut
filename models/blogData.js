const { Schema, model } = require("mongoose");

const blogDataSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
});

module.exports = model("BlogData", blogDataSchema);