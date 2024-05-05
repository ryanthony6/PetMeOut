const { Router } = require("express");
const profileRouter = Router();
const User = require("../../models/userData");
const FormData = require("../../models/formData");
const multer = require("multer");
const fs = require("fs");
const { isLoggedIn} = require("./middleware");

// Image upload Multer configuration
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

profileRouter.get("/profile/:id", isLoggedIn, async (req, res) => {
  const id = req.params.id;
  try {
    const profile = await User.findById(id);
    if (!profile) {
      res.redirect("/error");
    }
    // Render halaman edit FAQ dan kirim data FAQ ke dalam template
    res.render("editProfile.ejs", {
      layout: "headerlayout.ejs",
      isAuthenticated: true,
      profile: profile,
    });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).send("Failed to edit");
  }
});

// Route untuk memproses permintaan pengeditan profil
profileRouter.post("/editProfile/:id",upload.single("image"),async (req, res) => {
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

    res.redirect("/");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.redirect("/");
  }
});

// Delete account
profileRouter.delete("/deleteAccount/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Temukan pengguna
    const profile = await User.findById(userId);
    if (!profile) {
      return res.status(404).send("Profile not found");
    }

    // Hapus formulir terkait dengan pengguna yang dihapus
    await FormData.deleteMany({ userId: userId });

    // Jika gambar profil menggunakan template bawaan, jangan hapus
    if (profile.profilePict === "/img/profile-user.png") {
      await User.findByIdAndDelete(userId);
    } else {
      // Periksa apakah file gambar profil ada sebelum menghapusnya
      const profileImagePath = "./uploads/" + profile.profilePict;
      if (fs.existsSync(profileImagePath)) {
        // Hapus gambar profil
        fs.unlinkSync(profileImagePath);
      } else {
        console.error("Profile image file not found:", profileImagePath);
      }
      // Hapus pengguna
      await User.findByIdAndDelete(userId);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// menampilkan semua data form yang telah diajukan oleh user
profileRouter.get("/submittedforms", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id;
    const formDataList = await FormData.find({ userId: userId }).populate('petId');

    res.render("submittedForm.ejs", {
      layout: "mainlayout.ejs",
      formDataList: formDataList,
      isAuthenticated: true,
      isAdmin: req.user.isAdmin,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error fetching adoption form data:", error);
    req.flash("error", "Error fetching adoption form data");
    res.redirect("/error");
  }
});

// menghapus form
profileRouter.get("/deleteForm/:formId", isLoggedIn, async (req, res) => {
  try {
    const formId = req.params.formId;
    const form = await FormData.findByIdAndDelete(formId);
    if(!form) {
      res.redirect("/");
    }
    res.redirect("/");
  } catch (error) {
    console.error("Error canceling adoption form:", error);
    console.log("Error canceling adoption form:", error);
    req.flash("error", "Error canceling adoption form");
    res.redirect("/");
  }
});

module.exports = profileRouter;