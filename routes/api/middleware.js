function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/account");
  }
}

function isAdmin(req, res, next) {
  // Pastikan pengguna terotentikasi dan merupakan admin
  if (req.isAuthenticated() && req.user.isAdmin) {
    // Jika ya, lanjutkan ke rute berikutnya
    return next();
  }
  // Jika tidak, arahkan ke halaman login atau berikan pesan kesalahan
  res.redirect("/error"); // Atau sesuaikan dengan halaman login Anda
}

module.exports = { isLoggedIn, isAdmin };
