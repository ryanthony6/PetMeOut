const express = require("express");
const app = express();
const flash = require("connect-flash");
const session = require("express-session");
require("dotenv").config();
require("./utils/db");
const passport = require("./routes/api/passport");
const FAQ = require("./models/faqData");
const Blog = require("./models/blogData");
const Pet = require("./models/petData");
var morgan = require("morgan");
const port = process.env.PORT || 3000;
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
app.use("/userprofile", require("./routes/api/profile"));


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

// Routing untuk melakukan search,sort, filter
app.get("/pet", async (req, res) => {
  try {
    const { query, category, sorting } = req.query;
    let filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { breed: { $regex: query, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const sortOptions = {};
    if (sorting === "asc") {
      sortOptions.name = 1;
    } else if (sorting === "desc") {
      sortOptions.name = -1;
    }

    const pets = await Pet.find(filter)
      .sort(sortOptions)
      .limit(10); // Ubah batasan jumlah data yang dikembalikan

    res.json({ success: true, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Halaman About
app.get("/about", async (req, res) => {
  try {
    
    res.render("about.ejs", {
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

// Menghandle kategori yang ada pada blog 
app.get("/category", async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.blogCategory = category;
    }

    const blogs = await Blog.find(filter).limit(6);
    res.json({ success: true, blogs: blogs });
  } catch (err) {
    console.error("Error fetching blogs by category:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Route untuk load more button
app.get("/load-more", async (req, res) => {
  try {
    const { skip, category } = req.query;

    let filter = {};
    if (category && category !== 'All') {
      filter.blogCategory = category;
    }

    const blogs = await Blog.find(filter).skip(parseInt(skip)).limit(3);
    res.json(blogs);
  } catch (err) {
    console.error("Error fetching more blogs:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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

// Jika route tidak sesuai akan diarahkan ke halaman error ini
app.get("/error", (req, res) => {
  res.render("errorPage.ejs", {
    title: "error",
    layout: false,
    isAuthenticated: true,
  });
});


// Middleware untuk menangkap rute yang tidak cocok
app.use((req, res, next) => {
  res.status(404).render("errorPage.ejs", {
    title: "404 Not Found",
    layout: false,
    isAuthenticated: req.isAuthenticated(),
  });
});

// Middleware error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errorPage.ejs", {
    title: "500 Internal Server Error",
    layout: false,
    isAuthenticated: req.isAuthenticated(),
  });
});

app.listen(port, () => {
  console.log(`Webserver app listening on http://localhost:${port}/`);
});

