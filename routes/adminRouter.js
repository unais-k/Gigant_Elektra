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
    res.render("admin/addCategory", { message: false });
});
router.post("/addCategory", async (req, res, next) => {
    try {
        const categoryname = req.body.category;
        const categoryDescription = req.body.description;
        categoryModel.findOne({ categoryname: categoryname }, (err, data) => {
            console.log("category adding");
            if (data) {
                console.log(data);
                const category = new categoryModel({
                    categoryname: categoryname,
                    description: categoryDescription,
                });
                category
                    .save()
                    .then((answer) => {
                        res.redirect("/admin/addCategory");
                    })
                    .catch((error) => {
                        console.log(error);
                        next(error);
                    });
            } else {
                message = "This category already exists";
                res.redirect("/admin/addCategory");
                console.log("error");
            }
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = router;
