var express = require("express");
var router = express.Router();
const categoryModel = require("../models/categorySchema");

/* GET users listing. */
router.get("/", (req, res) => {
    res.render("admin/adminLogin", { message: false });
});

router.post("/adminLogin", (req, res, next) => {
    const adminEmail = process.env.adminEmail;
    const adminPassword = process.env.adminPassword;
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body);
    if (email == adminEmail) {
        console.log("email true");
        if (password == adminPassword) {
            req.session.adminLogin = true;
            res.render("admin/adminHome");
        } else {
            console.log("password error");
            req.session.adminLoginError = true;
            res.render("admin/adminLogin", { message: "password error" });
        }
    } else {
        console.log("email error");
        req.session.adminLoginError = true;
        res.render("admin/adminLogin", { message: "email error" });
    }
});

router.get("/adminHome", (req, res) => {
    res.render("admin/adminHome");
});

router.get("/addCategory", (req, res) => {
    res.render("admin/addCategory");
});
router.post("/addCategory", (req, res, next) => {
    if (req.session.admin) {
        const newCategory = req.body.category;

        categoryModel.find(
            {
                category: newCategory,
            },
            (err, data) => {
                if (data.length === 0) {
                    const category = new categoryModel({
                        category: newCategory,
                    });
                    category
                        .save()
                        .then((result) => {
                            console.log("category created");
                            res.redirect("/admin/addCategory");
                        })
                        .catch((err) => {
                            console.log("error while createing new category");
                            res.redirect("/admin/addCategory");
                        });
                } else {
                    console.log("category already exist");
                    res.redirect("/admin/addCategory");
                }
            }
        );
    }
});

module.exports = router;
