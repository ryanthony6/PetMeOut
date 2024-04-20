const {Router} = require('express')
const accountRouter = Router()
const bcrypt = require("bcrypt");
const UserData = require("../../models/userData");
const passport = require("./passport");
const nodemailer = require("nodemailer");
const { generateToken } = require("../../utils/token");

accountRouter.get("/", (req, res) => {
  res.render("signinup.ejs", {
    title: "Sign up/Sign in",
    layout: "SignupLayout.ejs",
    messages: req.flash(),
  });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
})
const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL, 
    to: email,
    subject: "Reset Password",
    text: `To reset your password, click on the following link: http://localhost:3000/account/resetPassword/${token}`,
    html: `<p>To reset your password, click on the following link: <a href="http://localhost:3000/account/resetPassword/${token}">Reset Password</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Error sending verification email");
  }
};

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
    const { email } = req.body;

    if (!email) {
      req.flash("error", "Email is required");
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

    if (!existingUser) {
      req.flash("error", "Email not found");
      return res.redirect("/forgotPassword");
    }


    const token = generateToken();

    existingUser.resetPasswordToken = token;
    existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await existingUser.save();

    await sendVerificationEmail(email, token);

    req.flash("success", "Verification email sent. Please check your email to reset your password.");
    res.redirect("/forgotPassword");
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    req.flash("error", "Error sending verification email");
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