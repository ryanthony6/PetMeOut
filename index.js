const express = require("express");
require("dotenv").config();
require("./utils/db");

const Pet = require("./models/petData");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 5000;
const expressLayouts = require("express-ejs-layouts");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));

// Image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage }).single("image");

app.get("/", (req, res) => {
  res.render("home.ejs", { title: "homepage", layout: "mainlayout.ejs" });
});

app.get("/FAQ", (req, res) => {
  res.render("FAQ.ejs", { title: "FAQ", layout: "mainlayout.ejs" });
});

app.get("/about", (req, res) => {
  res.render("about.ejs", { title: "about", layout: "mainlayout.ejs" });
});

app.get("/details", (req, res) => {
  res.render("details.ejs", { title: "details", layout: "detailslayout.ejs" });
});

app.get("/signinup", (req, res) => {
  res.render("signinup.ejs", { title: "details", layout: "SignupLayout.ejs" });
});

app.get("/add", (req, res) => {
  res.render("addPet.ejs", { title: "add_pet", layout: "detailslayout.ejs" });
});

// Insert pet data into database
app.post("/add", upload,async (req, res) => {

  // if (!req.file) {
  //   return res.status(400).json({ message: 'No file uploaded', type: 'error' });
  // }

  const pet = new Pet({
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    size: req.body.size,
    breed: req.body.breed,
    location: req.body.location,
    category: req.body.category,
    image: req.file.filename,
  });


  try {
    const newPet = await pet.save();
    res.send("Pet added successfully!");
  } catch (error) {
    console.error("Error adding pet:", error.message);
    res.status(500).send("Error adding pet data");
  }

});

app.listen(port, () => {
  console.log(`Webserver app listening on http://localhost:${port}/`);
});
