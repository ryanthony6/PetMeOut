const { Router } = require("express");
const petRouter = Router();
const Pet = require("../../models/petData");
const FormData = require("../../models/formData");
const fs = require("fs");
const multer = require("multer");

function isAdmin(req, res, next) {
  // Pastikan pengguna terotentikasi dan merupakan admin
  if (req.isAuthenticated() && req.user.isAdmin) {
    // Jika ya, lanjutkan ke rute berikutnya
    return next();
  }
  // Jika tidak, arahkan ke halaman login atau berikan pesan kesalahan
  res.redirect("/error"); // Atau sesuaikan dengan halaman login Anda
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/account");
  }
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

// Middleware for handling both single and array of files upload
var upload = multer({ storage: storage });


// Render halaman dashboard untuk admin
petRouter.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const pets = await Pet.find();

    res.render("dashboard.ejs", {
      pets: pets,
      title: "Dashboard",
      layout: "detailslayout.ejs",
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.isAdmin : false,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
});

petRouter.get("/add", isAdmin, (req, res) => {
  res.render("addPet.ejs", {
    title: "add_pet",
    layout: "detailslayout.ejs",
    isAuthenticated: req.isAuthenticated(),
    isAdmin: req.user ? req.user.isAdmin : false,
  });
});

// Insert pet data into database
petRouter.post(
  "/add",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "stockimage", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      if (
        !req.files ||
        !req.files["image"] ||
        req.files["image"].length === 0
      ) {
        return res
          .status(400)
          .json({ message: "No main image uploaded", type: "error" });
      }

      const mainImage = req.files["image"][0].filename;

      let stockImages = [];
      if (req.files["stockimage"] && req.files["stockimage"].length > 0) {
        stockImages = req.files["stockimage"].map((file) => file.filename);
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
        stockimage: stockImages,
      });

      const newPet = await pet.save();
      if (newPet) {
        res.redirect("/pets/dashboard");
      } else {
        res.status(500).send("Error adding pet data");
      }
    } catch (error) {
      console.error("Error adding pet:", error.message);
      res.status(500).send("Error adding pet data");
    }
  }
);

// Render halaman edit untuk mengedit data oleh admin
petRouter.get("/edit/:name", isAdmin, async (req, res) => {
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
petRouter.post(
  "/update/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "stockimage", maxCount: 3 },
  ]),
  async (req, res) => {
    let id = req.params.id;
    let new_image = req.body.old_image;
    let new_stock_images = [];

    if (req.files) {
      // Handle main image upload
      if (req.files["image"] && req.files["image"].length > 0) {
        new_image = req.files["image"][0].filename;
        try {
          fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
          console.log(err);
        }
      } else {
        new_image = req.body.old_image;
      }

      // Handle multiple stock image upload
      if (req.files["stockimage"] && req.files["stockimage"].length > 0) {
        // Delete old stock images
        req.body.old_stockimages.split(",").forEach((oldImage) => {
          try {
            fs.unlinkSync("./uploads/" + oldImage.trim());
          } catch (err) {
            console.log(err);
          }
        });

        // Store new stock images filenames
        new_stock_images = req.files["stockimage"].map((file) => file.filename);
      } else {
        new_stock_images = req.body.old_stockimages.split(",");
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
        stockimage: new_stock_images,
      });
      res.redirect("/pets/dashboard");
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }
);

// Delete pet
petRouter.delete("/delete/:id", async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) {
      return res.status(404).send("Pet not found");
    }

    // Delete main image
    fs.unlinkSync("./uploads/" + pet.image);
    pet.stockimage.forEach((filename) => {
      const trimmedFilename = filename.trim();
      try {
        fs.unlinkSync("./uploads/" + trimmedFilename);
      } catch (err) {
        console.error(err);
      }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Render halaman details jika sudah terdaftar maka akan ditampilkan, jika tidak register atau login dlu
petRouter.get("/details/:name", isLoggedIn, async (req, res) => {
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
petRouter.post("/adoption-form", async (req, res) => {
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

module.exports = petRouter;
