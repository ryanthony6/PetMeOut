const express = require("express");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const session = require("express-session");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();
require("./utils/db");

const passport = require("./models/passport");
const GoogleData = require("./models/googleData");
const Pet = require("./models/petData");
const UserData = require("./models/userData");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 5000;
const expressLayouts = require("express-ejs-layouts");

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use('/uploads', express.static('public/uploads'));


app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async function (req, accessToken, refreshToken, profile, done) {
  try {
    let user = await GoogleData.findOne({ googleId: profile.id });

    if (user) {
      console.log("User authenticated successfully:", user);
      // Tandai pengguna sebagai terautentikasi
      return done(null, user);
    } else {
      user = await GoogleData.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isAdmin: false
      });
      console.log("New user registered and authenticated:", user);
      // Tandai pengguna sebagai terautentikasi
      return done(null, user);
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return done(error, null);
  }
}
));

app.get("/auth/google/callback", passport.authenticate("google", {
  scope: ["profile", "email"],
  successRedirect: "/tes",
  failureRedirect: "/signinup"
}), (req, res) => {
  req.session.isAuthenticated = true;
  res.redirect("/tes");
});



app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated() || req.session.isAuthenticated;
  res.locals.currentUser = req.user;
  next();
});


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

// Halaman Home
app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("home.ejs", {
      title: "Home",
      layout: "mainlayout.ejs",
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
    });
  } else {
    res.render("home.ejs", {
      title: "Home",
      layout: "mainlayout.ejs",
      isAuthenticated: false,
    });
  }
});

app.get("/tes", async (req, res) => {
  try {
    let id = req.params.id;
    const pets = await Pet.find(id).exec();

    if (req.isAuthenticated()) {
      res.render("tes.ejs", {
        pets: pets,
        title: "Tes",
        layout: "mainlayout.ejs",
        isAuthenticated: true,
        isAdmin: req.user.isAdmin,
      });
    } else {
      res.render("tes.ejs", {
        pets: pets,
        title: "Tes",
        layout: "mainlayout.ejs",
        isAuthenticated: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/FAQ", (req, res) => {

  if (req.isAuthenticated()) {
    res.render("FAQ.ejs", {
      title: "Tes",
      layout: "mainlayout.ejs",
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
    });
  } else {
    res.render("FAQ.ejs", {
      title: "Tes",
      layout: "mainlayout.ejs",
      isAuthenticated: false,
    });
  }
  
});

app.get("/about", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("about.ejs", {
      title: "Tes",
      layout: "mainlayout.ejs",
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
    });
  } else {
    res.render("about.ejs", {

      title: "Tes",
      layout: "mainlayout.ejs",
      isAuthenticated: false,
    });
  }
});

// app.get("/details", isLoggedIn, (req, res) => {
//   res.render("details.ejs", {
//     title: "details",
//     layout: "detailslayout.ejs",
//     isAuthenticated: true,
//     isAdmin: req.user.isAdmin,
//   });
// });

app.get("/error", (req, res) => {
  res.render("errorPage.ejs", {
    title: "error",
    layout: false,
    isAuthenticated: true,
    isAdmin: req.user.isAdmin,
  });
});

// Render halaman sign-up
app.get("/signinup", (req, res) => {
  res.render("signinup.ejs", {
    title: "Sign up/Sign in",
    layout: "SignupLayout.ejs",
    messages: req.flash(),
  });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login", layout: false, messages: req.flash() });
});

app.get("/forgotPassword", (req, res) => {
  res.render("forgotPassword", { title: "forgotPassword", layout: false, messages: req.flash() });
});

app.get("/add", (req, res) => {
  res.render("addPet.ejs", {
    title: "add_pet",
    layout: "detailslayout.ejs",
    isAuthenticated: true,
    isAdmin: req.user.isAdmin,
  });
});

// Insert pet data into database
app.post("/add", upload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded", type: "error" });
  }
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
    if (newPet) {
      res.redirect("/dashboard");
    } else {
      res.status(500).send("Error adding pet data");
    }
  } catch (error) {
    console.error("Error adding pet:", error.message);
    res.status(500).send("Error adding pet data");
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const pets = await Pet.find();

    res.render("dashboard.ejs", {
      pets: pets,
      layout: "detailslayout.ejs",
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/edit/:name", async (req, res) => {
//   try {
//     let pet = await Pet.findById(req.params.id);

//     if (!pet) {
//       return res.redirect("/");
//     } else {
//       res.render("editPetData.ejs", {
//         layout: false,
//         pets: pet,
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     res.redirect("/tes");
//   }
// });

app.get("/edit/:name", async (req, res) => {
  try {
    let pet = await Pet.findOne({ name: req.params.name }); // Menggunakan findOne untuk mencari berdasarkan nama pet

    if (!pet) {
      return res.redirect("/");
    } else {
      res.render("editPetData.ejs", {
        layout: false,
        pets: pet,
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect("/tes");
  }
});


app.post("/update/:id", upload, async (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  try {
    await Pet.findByIdAndUpdate(id, {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      size: req.body.size,
      breed: req.body.breed,
      location: req.body.location,
      category: req.body.category,
      image: new_image,
    });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let pet = await Pet.findById(id).exec();

    if (!pet) {
      return res.redirect("/tes");
    } else {
      fs.unlinkSync("./uploads/" + pet.image);

      await Pet.findByIdAndDelete(id);
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/tes");
  }
});

// app.get("/detaails/:id", async (req, res) => {
//   let id = req.params.id;

//   let pet = await Pet.findById(id).exec();
//   res.render("detaails.ejs", {
//     title: "details",
//     pets: pet,
//     layout: "detailslayout.ejs",
//     isAuthenticated: true,
//     isAdmin: req.user.isAdmin,
//   });
// });


app.get("/detaails/:id", isLoggedIn, async (req, res) => {
  try {
    let id = req.params.id;
    let pet = await Pet.findById(id);

      res.render("detaails.ejs", {
        layout: false,
        pets: pet,
        isAuthenticated: true,
        isAdmin: req.user.isAdmin,
      });
    
  } catch (err) {
    console.error(err);
    res.redirect("/tes");
  }
});


// Route untuk sign up
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validasi email menggunakan regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Invalid email address");
      return res.redirect("/signinup");
    }

    // Cek apakah username sudah ada dalam database
    const existingUser = await UserData.findOne({ username });
    if (existingUser) {
      req.flash("error", "Username already exists");
      return res.redirect("/signinup");
    }

    // Cek apakah email sudah terdaftar
    const existingEmail = await UserData.findOne({ email });
    if (existingEmail) {
      req.flash("error", "Email already registered");
      return res.redirect("/signinup");
    }

    // Enkripsi password sebelum disimpan di database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan data pengguna baru ke dalam database
    const newUser = new UserData({ username, email, password: hashedPassword });
    await newUser.save();

    req.flash("success", "User registered successfully! Please login.");
    res.redirect("/signinup");
  } catch (error) {
    console.error("Error registering user:", error.message);
    req.flash("error", "Error registering user");
    res.redirect("/signinup");
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/signinup");
  }
}

app.post("/forgotPassword", async (req, res) => {
  try {
    const { email, password, confirmNewPassword } = req.body;

    // Check if passwords match
    if (password !== confirmNewPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/forgotPassword");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password in the database
    const user = await UserData.findOneAndUpdate(
      { email: email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      req.flash("error", "Email not found");
      return res.redirect("/forgotPassword");
    }

    req.flash("success", "Password updated successfully");
    res.redirect("/forgotPassword");
  } catch (error) {
    console.error("Error updating password:", error.message);
    req.flash("error", "Error updating password");
    res.redirect("/forgotPassword");
  }
});



// Route untuk login
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/tes",
    failureRedirect: "/signinup",
    failureFlash: true,
  })
);

async function createAdmin() {
  try {
    const existingAdmin = await UserData.findOne({ isAdmin: true });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      const adminData = {
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        isAdmin: true,
      };

      const newAdmin = new UserData(adminData);
      await newAdmin.save();
      console.log("Admin account created successfully.");
    } else {
      console.log("Admin account already exists.");
    }
  } catch (error) {
    console.error("Error creating admin account:", error.message);
  }
}
createAdmin();

// Route untuk logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Error logging out");
    }
    req.session.destroy(() => {
      res.redirect("/tes");
    })
  });
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.listen(port, () => {
  console.log(`Webserver app listening on http://localhost:${port}/`);
});
