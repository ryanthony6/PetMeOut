const { Router } = require("express");
const forgotRouter = Router();
const bcrypt = require("bcrypt");
const User = require("../../models/userData");
const nodemailer = require("nodemailer");
const { generateToken } = require("../../utils/token");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});
const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Reset Password",
    text: `To reset your password, click on the following link: http://localhost:3000/forgotpass/resetPassword/${token}`,
    html: `<p>To reset your password, click on the following link: <a href="http://localhost:3000/forgotpass/resetPassword/${token}">Reset Password</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Error sending verification email");
  }
};


forgotRouter.get("/", (req, res) => {
    res.render("forgotPassword", {
      title: "forgotPassword",
      layout: "headerlayout.ejs",
      messages: req.flash(),
    });
  });
  

forgotRouter.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      req.flash("error", "Email is required");
      return res.redirect("/");
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser && existingUser.isAdmin) {
      req.flash(
        "error",
        "This is an admin account. Password cannot be changed."
      );
      return res.redirect("/forgotpass");
    }

    if (!existingUser) {
      req.flash("error", "Email not found");
      return res.redirect("/forgotpass");
    }

    const token = generateToken();

    existingUser.resetPasswordToken = token;
    existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await existingUser.save();

    await sendVerificationEmail(email, token);

    req.flash(
      "success",
      "Verification email sent. Please check your email to reset your password."
    );
    res.redirect("/forgotpass");
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    req.flash("error", "Error sending verification email");
    res.redirect("/forgotpass");
  }
});

forgotRouter.get("/resetPassword/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Cari pengguna berdasarkan token reset password
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Invalid or expired token");
      return res.redirect("/forgotpass");
    }
    res.render("resetPassword.ejs", {
      title: "Reset Password",
      layout: "headerlayout.ejs",
      token: token,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    req.flash("error", "Error resetting password");
    res.redirect("/forgotpass");
  }
});

forgotRouter.post("/resetPassword/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const { password, confirmNewPassword } = req.body;

    if (password !== confirmNewPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect(`/forgotpass/resetPassword/${token}`);
    }

    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long");
      return res.redirect(`/forgotpass/resetPassword/${token}`);
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

    req.flash(
      "success",
      "Password reset successfully. Please login with your new password."
    );
    console.log("Success message:", req.flash("success"));
    res.redirect("/account");
  } catch (error) {
    console.error("Error resetting password:", error.message);
    req.flash("error", "Error resetting password");
    res.redirect("/forgotpass"); // Atau halaman lain yang sesuai
  }
});

module.exports = forgotRouter;
