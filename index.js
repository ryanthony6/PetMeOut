const express = require("express");
const app = express();
const flash = require("connect-flash");
const session = require("express-session");
require("dotenv").config();
require("./utils/db");
const passport = require("./routes/api/passport");
const FAQ = require("./models/faqData");
const User = require("./models/userData");
const Blog = require("./models/blogData");
const multer = require("multer");
const fs = require("fs");
const Pet = require("./models/petData");
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

app.use((req, res, next) => {
  res.locals.isAuthenticated =
    req.isAuthenticated() || req.session.isAuthenticated;
  res.locals.currentUser = req.user;
  next();
});

app.use("/account", require("./routes/api/account"));
app.use("/forgotpass", require("./routes/api/forgot"));
app.use("/pets", require("./routes/api/petList"));
app.use("/blogs", require("./routes/api/blogAdmin"));
app.use("/faqs", require("./routes/api/faqAdmin"));


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
    const blogs = await Blog.find(id);

    res.render("about.ejs", {
      blogs: blogs,
      title: "About",
      layout: "mainlayout.ejs",
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.isAdmin : false,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// Halaman blog
app.get("/blog", async (req, res) => {
  try {
    const blogs = await Blog.find().limit(3); // Fetch the first set of 3 blog posts

    res.render("blog.ejs", {
      blogs: blogs,
      title: "Blog",
      layout: "mainlayout.ejs",
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.isAdmin : false,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// Handle requests for more blog posts
app.get("/blog/load-more", async (req, res) => {
  try {
    const { skip } = req.query;
    const blogs = await Blog.find().skip(parseInt(skip)).limit(3); // Skip already loaded posts

    res.json(blogs);
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
    res.render("FAQ.ejs", {
      faqCategories: faqCategories, 
      title: "FAQ",
      layout: "mainlayout.ejs",
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.isAdmin : false,
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).send('Failed to fetch FAQs');
  }
});

app.get('/profile/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const profile = await User.findById(id);
    if (!profile) {
      res.redirect('/error')
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

app.post('/editProfile/:id', upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    let newProfileImage = req.body.old_profile_image; // Changed variable name to newProfileImage

    if (req.file) {
      newProfileImage = req.file.filename;
      // Delete the old file if it exists
      if (req.body.old_profile_image) {
        try {
          fs.unlinkSync("./uploads/" + req.body.old_profile_image);
        } catch (err) {
          console.error("Error deleting old image file:", err);
        }
      }
    } else {
      // Use the old image if no new image is provided
      newProfileImage = req.body.old_profile_image;
    }

    // Update user profile with new data
    await User.findByIdAndUpdate(id, {
      username: req.body.username,
      profilePict: newProfileImage, // Changed variable name to newProfileImage
    });

    res.redirect('/');
  } catch (err) {
    console.error("Error updating profile:", err);
    res.redirect("/");
  }
});

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

// Jika route tidak sesuai akan diarahkan ke halaman error ini
app.get("/error", (req, res) => {
  res.render("errorPage.ejs", {
    title: "error",
    layout: false,
    isAuthenticated: true,
  });
});

app.get("/petss", async (req, res) => {
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
