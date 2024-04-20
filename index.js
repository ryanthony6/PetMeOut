const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const flash = require("connect-flash");
const session = require("express-session");
require("dotenv").config();
require("./utils/db");
const FormData = require("./models/formData");
const passport = require("./routes/api/passport");
const Pet = require("./models/petData");
const FAQ = require("./models/faqData");
const Blog = require("./models/blogData");
const User = require("./models/userData");
const multer = require("multer");
const fs = require("fs");
require("nodemailer");
require("./utils/token");
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
var upload = multer({ storage: storage });

// Halaman Home
app.get("/",async (req, res) => {
  try {
    let id = req.params.id;
    const pets = await Pet.find(id);

    res.render("home.ejs", {
      pets: pets,
      title: "Home",
      layout: "mainlayout.ejs",
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.isAdmin : false,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// Halaman About
app.get("/about", async (req, res) => {
  try {
    let id = req.params.id;
    const blogs = await Blog.find(id).exec();

    if (req.isAuthenticated()) {
      res.render("about.ejs", {
        blogs: blogs,
        title: "Tes",
        layout: "mainlayout.ejs",
        isAuthenticated: true,
        isAdmin: req.user.isAdmin,
      });
    } else {
      res.render("about.ejs", {
        blogs: blogs,
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

// Halaman FAQ
app.get("/FAQ", async (req, res) => {
  try {
    const allFaqs = await FAQ.find(); // Ambil semua data FAQ dari database

    // Mengelompokkan FAQ berdasarkan kategori
    const faqCategories = {};
    allFaqs.forEach(faq => {
      if (!faqCategories[faq.category]) {
        faqCategories[faq.category] = [];
      }
      faqCategories[faq.category].push(faq);
    });

    if (req.isAuthenticated()) {
      res.render("FAQ.ejs", {
        title: "Tes",
        layout: "mainlayout.ejs",
        isAuthenticated: true,
        isAdmin: req.user.isAdmin,
        faqCategories: faqCategories // Kirim data FAQ ke halaman FAQ untuk ditampilkan
      });
    } else {
      res.render("FAQ.ejs", {
        title: "Tes",
        layout: "mainlayout.ejs",
        isAuthenticated: false,
        isAdmin: false,
        faqCategories: faqCategories // Kirim data FAQ ke halaman FAQ untuk ditampilkan
      });
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).send('Failed to fetch FAQs');
  }
});


app.get("/addFAQ", (req, res) => {
  res.render("AddFAQ.ejs", {
    title: "add_faq",
    layout: "detailslayout.ejs",
    isAuthenticated: true,
    isAdmin: req.user.isAdmin,
  });
});


app.post('/addFaqData', async (req, res) => {
  const { faqTitle, faqContent, faqCategory } = req.body;
  try {
    const newFAQ = new FAQ({
      title: faqTitle,
      content: faqContent,
      category: faqCategory
    });
    await newFAQ.save();
    res.redirect('/FAQ');
  } catch (error) {
    console.error('Error adding FAQ:', error);
    res.status(500).send('Failed to add FAQ');
  }
});

// Route untuk menghapus FAQ berdasarkan ID
app.delete("/deleteFaq/:id", async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).send("FAQ not found");
    }

    // Tindakan tambahan yang mungkin diperlukan, seperti menghapus referensi FAQ dari entitas lain

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route untuk mengambil halaman edit FAQ berdasarkan ID
app.get('/editFaq/:id', async (req, res) => {
  const faqId = req.params.id;
  try {
    // Cari FAQ dari database berdasarkan ID
    const faq = await FAQ.findById(faqId);
    if (!faq) {
      return res.status(404).send('FAQ not found');
    }
    // Render halaman edit FAQ dan kirim data FAQ ke dalam template
    res.render('editFAQ.ejs', {
      title: 'editFAQ',
      layout: false,
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
      faq: faq
    });
  } catch (error) {
    console.error('Error editing FAQ:', error);
    res.status(500).send('Failed to edit FAQ');
  }
});

// Route untuk memproses permintaan pengeditan FAQ
app.post('/editFaq/:id', async (req, res) => {
  const faqId = req.params.id;
  const { faqTitle, faqContent, faqCategory } = req.body;
  try {
    // Temukan FAQ yang akan diubah berdasarkan ID
    const faq = await FAQ.findById(faqId);
    if (!faq) {
      return res.status(404).send('FAQ not found');
    }
    // Perbarui informasi FAQ dengan data baru
    faq.title = faqTitle;
    faq.content = faqContent;
    faq.category = faqCategory;
    // Simpan perubahan ke database
    await faq.save();
    res.redirect('/FAQ');
  } catch (error) {
    console.error('Error editing FAQ:', error);
    res.status(500).send('Failed to edit FAQ');
  }
});

app.get('/profile/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const profile = await User.findById(id);
    if (!profile) {
      return res.status(404).send('User not Found');
    }
    // Render halaman edit FAQ dan kirim data FAQ ke dalam template
    res.render('editProfile.ejs', {
      layout: false,
      isAuthenticated: true,
      profile: profile
    });
  } catch (error) {
    console.error('Error editing:', error);
    res.status(500).send('Failed to edit');
  }
});

app.post('/editProfile/:id', upload.single("image"),async (req, res) => {
  try {
    const id = req.params.id;
    let newImage = req.body.old_image;

    // Check if a file was uploaded
    if (req.file) {
      newImage = req.file.filename;
      
      // Attempt to delete the old image file
      if (req.body.old_image) {
        try {
          fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
          console.error("Error deleting old image file:", err);
        }
      }
    }

    // Update user profile with new data
    await User.findByIdAndUpdate(id, {
      username: req.body.username,
      profilePict: newImage,
    });

    res.redirect("/");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.redirect("/");
  }
})

app.delete("/deleteAccount/:id", async (req, res) => {
  try {
    const profile = await User.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).send("Pet not found");
    }

    // Delete main image
    fs.unlinkSync("./uploads/" + profile.profilePict);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/account/resetPassword/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Cari pengguna berdasarkan token reset password
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Invalid or expired token");
      return res.redirect("/forgotPassword"); 
    }
    res.render("resetPassword.ejs", {
      title: "Reset Password",
      layout: false,
      token: token,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    req.flash("error", "Error resetting password");
    res.redirect("/forgotPassword"); 
  }
});

app.post("/account/resetPassword/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const { password, confirmNewPassword } = req.body;

    if (password !== confirmNewPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect(`/account/resetPassword/${token}`);
    }

    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long");
      return res.redirect(`/account/resetPassword/${token}`);
    }

    // Cari pengguna berdasarkan token reset password
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token masih valid
    });

    // Enkripsi password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan password baru ke dalam database
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash("success", "Password reset successfully. Please login with your new password.");
    console.log("Success message:", req.flash("success"));
    res.redirect("/account")
  } catch (error) {
    console.error("Error resetting password:", error.message);
    req.flash("error", "Error resetting password");
    res.redirect("/forgotPassword"); // Atau halaman lain yang sesuai
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


app.get("/blog", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.render("blogDashboard.ejs", {
      blogs: blogs,
      layout: "detailslayout.ejs",
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// Insert pet data into database
app.post(
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
        res.redirect("/dashboard");
      } else {
        res.status(500).send("Error adding pet data");
      }
    } catch (error) {
      console.error("Error adding pet:", error.message);
      res.status(500).send("Error adding pet data");
    }
  }
);

app.post("/addBlog", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No image uploaded", type: "error" });
    }

    const blog = new Blog({
      title: req.body.title,
      desc: req.body.desc,
      link: req.body.link,
      image: req.file.filename,
    });

    const newBlog = await blog.save();
    if (newBlog) {
      res.redirect("/blog"); // Redirect to dashboard after successful addition
    } else {
      res.status(500).send("Error adding blog");
    }
  } catch (error) {
    console.error("Error adding blog:", error.message);
    res.status(500).send("Error adding blog");
  }
});

app.delete("/deleteBlog/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).send("Pet not found");
    }

    // Delete main image
    fs.unlinkSync("./uploads/" + blog.image);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/editBlog/:title", async (req, res) => {
  try {
    let blog = await Blog.findOne({ title: req.params.title });

    if (!blog) {
      return res.redirect("/");
    } else {
      res.render("editBlogData.ejs", {
        layout: false,
        blogs: blog,
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

app.post("/updateBlog/:id",upload.single("image"), async (req, res) => {
  let id = req.params.id;
  let new_image = req.body.old_image;

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
    await Blog.findByIdAndUpdate(id, {
      title: req.body.title,
      desc: req.body.desc,
      link: req.body.link,
      image: new_image,
    });
    res.redirect("/blog");
  } catch (err) {
    console.log(err);
    res.redirect("/");
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
app.post(
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
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }
);

// Delete pet
app.delete("/delete/:id", async (req, res) => {
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
