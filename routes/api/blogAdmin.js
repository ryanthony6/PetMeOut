const { Router } = require("express");
const blogRouter = Router();
const Blog = require("../../models/blogData");
const fs = require("fs");
const multer = require("multer");

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

blogRouter.get("/dashboard", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.render("blogDashboard.ejs", {
      blogs: blogs,
      layout: "detailslayout.ejs",
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
    });
  } catch (err) {
    res.redirect("/error");
  }
});

blogRouter.post("/addBlog", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No image uploaded", type: "error" });
    }

    const blog = new Blog({
      title: req.body.title,
      desc: req.body.desc,
      author: req.body.author,
      blogCategory: req.body.blogCategory,
      link: req.body.link,
      image: req.file.filename,
    });

    const newBlog = await blog.save();
    if (newBlog) {
      res.redirect("/blogs/dashboard"); // Redirect to dashboard after successful addition
    } else {
      res.status(500).send("Error adding blog");
    }
  } catch (error) {
    console.error("Error adding blog:", error.message);
    res.status(500).send("Error adding blog");
  }
});

blogRouter.delete("/deleteBlog/:id", async (req, res) => {
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

blogRouter.get("/editBlog/:title", async (req, res) => {
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

blogRouter.post("/updateBlog/:id", upload.single("image"), async (req, res) => {
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
      author: req.body.author,
      blogCategory: req.body.blogCategory,
      link: req.body.link,
      image: new_image,
    });
    res.redirect("/blogs/dashboard");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});


module.exports = blogRouter;
