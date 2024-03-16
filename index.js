const express = require("express")

const app = express();

const port = 3000;

const expressLayouts = require('express-ejs-layouts');

app.set("view engine", "ejs");

app.use(expressLayouts);

app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Webserver app listening on port ${port}`);
})

app.get("/", (req, res) => {
    res.render("home.ejs", {title : "homepage", layout: 'mainlayout.ejs'})
})

app.get("/FAQ", (req, res) => {
    res.render("FAQ.ejs", {title : "FAQ", layout: 'mainlayout.ejs'})
})

app.get("/about", (req, res) => {
    res.render("about.ejs", {title : "about", layout: 'mainlayout.ejs'})
})

app.get("/details", (req, res) => {
    res.render("details.ejs", {title : "details", layout: 'detailslayout.ejs'})
})

app.get("/signinup", (req, res) => {
    res.render("signinup.ejs", {title : "details", layout: 'SignupLayout.ejs'})
})