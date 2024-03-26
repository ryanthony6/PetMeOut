const express = require("express");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const session = require("express-session");
require("dotenv").config();
require("./utils/db");

const Pet = require("./models/petData");
const UserData = require("./models/userData");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 5000;
const expressLayouts = require("express-ejs-layouts");

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));

app.use(session({
  secret: 'secret', // Ganti dengan secret key yang lebih aman
  resave: true,
  saveUninitialized: true
}));



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

// Render halaman sign-up
app.get("/signinup", (req, res) => {
  res.render("signinup.ejs", { title: "details", layout: "SignupLayout.ejs", messages: req.flash() });
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

// Route untuk sign up
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validasi email menggunakan regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash('error', 'Invalid email address');
      return res.redirect("/signinup");
    }

    // Cek apakah username sudah ada dalam database
    const existingUser = await UserData.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists');
      return res.redirect("/signinup");
    }

    // Cek apakah email sudah terdaftar
    const existingEmail = await UserData.findOne({ email });
    if (existingEmail) {
      req.flash('error', 'Email already registered');
      return res.redirect("/signinup");
    }

    // Enkripsi password sebelum disimpan di database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan data pengguna baru ke dalam database
    const newUser = new UserData({ username, email, password: hashedPassword });
    await newUser.save();

    req.flash('success', 'User registered successfully! Please login.');
    res.redirect("/signinup");
  } catch (error) {
    console.error("Error registering user:", error.message);
    req.flash('error', 'Error registering user');
    res.redirect("/signinup");
  }
});

// Route untuk login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari pengguna berdasarkan email
    const user = await UserData.findOne({ email });
    if (!user) {
      req.flash('error', 'Email not found');
      return res.redirect("/signinup");
    }

    // Bandingkan password yang dimasukkan dengan password yang di-hash yang tersimpan dalam database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      req.flash('error', 'Incorrect password');
      return res.redirect("/signinup");
    }
    // Jika email dan password cocok, alihkan pengguna ke halaman home
    res.redirect("/");
  } catch (error) {
    console.error("Error logging in:", error.message);
    req.flash('error', 'Error logging in');
    res.redirect("/signinup");
  }
});

app.listen(port, () => {
  console.log(`Webserver app listening on http://localhost:${port}/`);
});
