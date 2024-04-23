
const { Router } = require("express");
const faqRouter = Router();
const FAQ = require("../../models/faqData");
const {isAdmin} = require('../../index.js');

faqRouter.get("/addFAQ", isAdmin,(req, res) => {
  res.render("AddFAQ.ejs", {
    title: "add_faq",
    layout: "detailslayout.ejs",
    isAuthenticated: true,
    isAdmin: req.user.isAdmin,
  });
});

faqRouter.post('/addFaqData',async (req, res) => {
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
faqRouter.delete("/deleteFaq/:id", async (req, res) => {
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
faqRouter.get('/editFaq/:id', isAdmin,async (req, res) => {
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
faqRouter.post('/editFaq/:id', async (req, res) => {
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

module.exports = faqRouter;
