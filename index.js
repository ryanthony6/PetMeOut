const express = require("express");
const session = require("express-session");
require("dotenv").config();
require("./utils/db");

const Pet = require("./models/petData");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 5000;
const expressLayouts = require("express-ejs-layouts");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.static("uploads"));

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

app.use(
  session({
    secret: "your_secret_key_here",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// route navbar
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
app.post("/add", upload, async (req, res) => {
  // if (!req.file) {
  //   return res.status(400).json({ message: "No file uploaded", type: "error" });
  // }

  const pet = new Pet({
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    size: req.body.size,
    breed: req.body.breed,
    location: req.body.location,
    category: req.body.category,
    // image: req.file.filename,
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
    const pets = await Pet.find().exec();
  
    res.render("dashboard.ejs", {
      pets: pets,
      layout: "detailslayout.ejs",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/edit/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let pet = await Pet.findById(id).exec();

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

// app.post("/update/:id", upload, async (req, res) => {
//   let id = req.params.id;
//   // let new_image = "";

//   // if (req.file) {
//   //   new_image = req.file.filename;
//   //   try {
//   //     fs.unlinkSync("./uploads/" + req.body.old_image);
//   //   } catch (err) {
//   //     console.log(err);
//   //   }
//   // } else {
//   //   new_image = req.body.old_image;
//   // }

//   Pet.findByIdAndUpdate(
//     id,
//     {
//       name: req.body.name,
//       age: req.body.age,
//       gender: req.body.gender,
//       size: req.body.size,
//       breed: req.body.breed,
//       location: req.body.location,
//       category: req.body.category,
//       // image: new_image,
//     },
//     (err, result) => {
//       if (err) {
//         console.log(err);
//         res.redirect("/");
//       } else {
//         res.redirect("/dashboard");
//       }
//     }
//   );
// });

app.post("/update/:id", upload, async (req, res) => {
  try {
    let id = req.params.id;

    await Pet.findByIdAndUpdate(id, {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      size: req.body.size,
      breed: req.body.breed,
      location: req.body.location,
      category: req.body.category,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// app.get("/delete/:id", async (req, res) => {
//   let id = req.params.id;
//   let pet = await Pet.findById(id).exec();
//   if (!pet) {
//     return res.redirect("/");
//   } else {
//     // fs.unlinkSync("./uploads/" + pet.image);
//     await Pet.findByIdAndDelete(id, (err, result) => {
//       if (err) {
//         console.log(err);
//         res.redirect("/");
//       } else {
//         res.redirect("/dashboard");
//       }
//     });
//   }
// })

app.get("/delete/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let pet = await Pet.findById(id).exec();

    if (!pet) {
      return res.redirect("/");
    } else {
      // fs.unlinkSync("./uploads/" + pet.image);

      await Pet.findByIdAndDelete(id);
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Webserver app listening on http://localhost:${port}/`);
});
