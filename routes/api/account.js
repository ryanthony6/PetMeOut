const {Router} = require('express')
const accountRouter = Router()
const bcrypt = require("bcrypt");
const UserData = require("../../models/userData");
const passport = require("./passport");

accountRouter.get("/", (req, res) => {
  res.render("signinup.ejs", {
    title: "Sign up/Sign in",
    layout: "SignupLayout.ejs",
    messages: req.flash(),
  });
});

// Route untuk sign up
accountRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validasi email menggunakan regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Invalid email address");
      return res.redirect("/account");
    }

    // Cek apakah email sudah terdaftar
    const existingEmail = await UserData.findOne({ email });
    if (existingEmail) {
      req.flash("error", "Email already registered");
      return res.redirect("/account");
    }

    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long");
      return res.redirect("/account");
    }

    // Enkripsi password sebelum disimpan di database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan data pengguna baru ke dalam database
    const newUser = new UserData({ username, email, password: hashedPassword });
    await newUser.save();

    req.flash("success", "User registered successfully! Please login.");
    res.redirect("/account");
  } catch (error) {
    // console.error("Error registering user:", error.message);
    console.error(error);
    // req.flash("error", "Error registering user");
    res.redirect("/account");
  }
});

// Route untuk login menggunakan passport js
accountRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/account",
    failureFlash: true,
  })
);


accountRouter.post("/forgotPassword", async (req, res) => {
  try {
    const { email, password, confirmNewPassword } = req.body;

    // Check if passwords match
    if (password !== confirmNewPassword) {
      req.flash("error", "Passwords does not match");
      return res.redirect("/forgotPassword");
    }

    if(password === confirmNewPassword && password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long");
      return res.redirect("/forgotPassword");
    }

    if (!email) {
      req.flash("error", "Email is required");
      return res.redirect("/forgotPassword");
    }

    if (!password) {
      req.flash("error", "Password is required");
      return res.redirect("/forgotPassword");
    }

    const existingUser = await UserData.findOne({ email: email });
    if (existingUser && existingUser.isAdmin) {
      req.flash(
        "error",
        "This is an admin account. Password cannot be changed."
      );
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

// Route untuk logout
accountRouter.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Error logging out");
    }
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

module.exports = accountRouter;