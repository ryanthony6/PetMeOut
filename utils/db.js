const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log(`MongoDB connected ${process.env.MONGO_URL}`))
  .catch((err) => console.log(err));
