const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String
});


const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
