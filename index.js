const express = require("express");
const app = express();
const flash = require("connect-flash");
const session = require("express-session");
require("dotenv").config();
require("./utils/db");
const FormData = require("./models/formData");
const passport = require("./routes/api/passport");
const Pet = require("./models/petData");
const multer = require("multer");
const fs = require("fs");
var morgan = require("morgan");

const port = process.env.PORT || 5000;
const expressLayouts = require("express-ejs-layouts");

app.use(express.urlencoded({ extended: true }));
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
app.use(flash());
app.use(express.json());
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use("/account", require("./routes/api/account"));

app.use((req, res, next) => {
  res.locals.isAuthenticated =
    req.isAuthenticated() || req.session.isAuthenticated;
  res.locals.currentUser = req.user;
  next();
});

// Image upload
// Multer configuration
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

// Middleware for handling both single and array of files upload
var upload = multer({ storage})

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    successRedirect: "/",
    failureRedirect: "/account",
  }),
  (req, res) => {
    req.session.isAuthenticated = true;
    res.redirect("/");
  }
);

app.get("/tes", (req, res) => {
  res.render("tes.ejs", {
    layout: false,
  });
});

// Halaman Home
app.get("/", async (req, res) => {
  try {
    let id = req.params.id;
    const pets = await Pet.find(id).exec();

    if (req.isAuthenticated()) {
      res.render("home.ejs", {
        pets: pets,
        title: "Home",
        layout: "mainlayout.ejs",
        isAuthenticated: true,
        isAdmin: req.user.isAdmin,
        messages: req.flash(),
      });
    } else {
      res.render("home.ejs", {
        pets: pets,
        title: "Home",
        layout: "mainlayout.ejs",
        isAuthenticated: false,
        messages: req.flash(),
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// Halaman About
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

// Halaman FAQ
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

// Jika route tidak sesuai akan diarahkan ke halaman error ini
app.get("/error", (req, res) => {
  res.render("errorPage.ejs", {
    title: "error",
    layout: false,
    isAuthenticated: true,
  });
});

// Render halaman forgot password
app.get("/forgotPassword", (req, res) => {
  res.render("forgotPassword", {
    title: "forgotPassword",
    layout: false,
    messages: req.flash(),
  });
});

// Render halaman add
app.get("/add", (req, res) => {
  res.render("addPet.ejs", {
    title: "add_pet",
    layout: "detailslayout.ejs",
    isAuthenticated: true,
    isAdmin: req.user.isAdmin,
  });
});

// Insert pet data into database
app.post("/add", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "stockimage", maxCount: 3 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files['image'] || req.files['image'].length === 0) {
      return res.status(400).json({ message: "No main image uploaded", type: "error" });
    }

    const mainImage = req.files['image'][0].filename;

    let stockImages = [];
    if (req.files['stockimage'] && req.files['stockimage'].length > 0) {
      stockImages = req.files['stockimage'].map(file => file.filename);
    }

    const pet = new Pet({
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      size: req.body.size,
      breed: req.body.breed,
      location: req.body.location,
      category: req.body.category,
      description: req.body.description,
      image: mainImage,
      stockimage: stockImages
    });

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


// Render halaman dashboard untuk admin
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

// Render halaman edit untuk mengedit data oleh admin
app.get("/edit/:name", async (req, res) => {
  try {
    let pet = await Pet.findOne({ name: req.params.name });

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
    res.redirect("/");
  }
});

// Update pet data
app.post("/update/:id", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "stockimage", maxCount: 3 }
]), async (req, res) => {
  let id = req.params.id;
  let new_image = req.body.old_image;
  let new_stock_images = req.body.old_stockimages ? req.body.old_stockimages.split(",") : [];

  if (req.files) {
    // Handle main image upload
    if (req.files['image'] && req.files['image'].length > 0) {
      new_image = req.files['image'][0].filename;
      // Delete old main image
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    }

    // Handle multiple stock image upload
    if (req.files['stockimage'] && req.files['stockimage'].length > 0) {
      // Delete old stock images if they exist
      if (new_stock_images.length > 0) {
        new_stock_images.forEach(oldImage => {
          try {
            fs.unlinkSync("./uploads/" + oldImage.trim());
          } catch (err) {
            console.log(err);
          }
        });
      }

      // Store new stock images filenames
      new_stock_images = req.files['stockimage'].map(file => file.filename);
    }
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
      description: req.body.description,
      image: new_image,
      stockimage: new_stock_images.join(",")
    });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});


// Delete pet
app.delete("/delete/:id", async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) {
      return res.status(404).send("Pet not found");
    }

    // Delete main image
    fs.unlinkSync("./uploads/" + pet.image);

    // Delete stock images
    if (Array.isArray(pet.stockimage)) {
      pet.stockimage.forEach(filename => {
        fs.unlinkSync("./uploads/" + filename);
      });
    } else {
      // If stockimage is a string, delete it as a single file
      fs.unlinkSync("./uploads/" + pet.stockimage);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Render halaman details jika sudah terdaftar maka akan ditampilkan, jika tidak register atau login dlu
app.get("/details/:name", isLoggedIn, async (req, res) => {
  try {
    let petName = req.session.petName || req.params.name;
    let pet = await Pet.findOne({ name: petName });

    if (!pet) {
      return res.render("errorPage.ejs", {
        layout: false,
        isAuthenticated: true,
        isAdmin: req.user.isAdmin,
        messages: req.flash(),
      });
    }

    res.render("details.ejs", {
      layout: "detailslayout.ejs",
      pets: pet,
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
      messages: req.flash(),
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Route for handling form submission
app.post("/adoption-form", async (req, res) => {
  try {
    // Proses penyimpanan data formulir adopsi ke MongoDB
    const formData = new FormData({
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      dob: req.body.dob,
      address: req.body.address,
      phone: req.body.phone,
      havePets: req.body.havePets,
      haveChildren: req.body.haveChildren,
    });
    await formData.save();

    // Mengarahkan kembali ke halaman utama dengan pop-up SweetAlert2
    req.flash("success", "Successful, your form has been submitted");
    res.redirect("/");
  } catch (error) {
    console.error("Error submitting adoption form:", error);
    req.flash("error", "Error submitting adoption form");
    res.redirect("/");
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/account");
  }
}

app.get("/pets", async (req, res) => {
  try {
    const { query, category } = req.query;
    let filter = {};

    if (query) {
      filter = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { breed: { $regex: query, $options: "i" } },
        ],
      };
    }

    if (category) {
      filter.category = category;
    }
    const pets = await Pet.find(filter);
    res.json({ success: true, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Webserver app listening on http://localhost:${port}/`);
});
