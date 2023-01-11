var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");
// const { otpCalling, otpVeryfication } = require("../config/otp");

/* GET home page. */
router.get("/", (req, res, next) => {
    res.render("user/userHome");
});
router.get("/userLogin", (req, res) => {
    res.render("user/userLogin", { message: false });
});
router.post("/userLogin", async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    if (await userModel.findOne({ username: username })) {
        if (await userModel.findOne({ password: password })) {
            req.session.user = true;
            res.render("user/userHome");
        } else {
            res.render("user/userLogin", { message: "Password error" });
        }
    } else {
        res.render("user/userLogin", { message: "username error" });
    }
    res.render("user/userHome");
});
router.get("/userRegister", (req, res, next) => {
    res.render("user/userRegister", { message: false });
});
router.post("/userRegisterPost", async (req, res, next) => {
    const userDetails = {
        name: req.body.name,
        username: req.body.username,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
    };
    try {
        if (req.session.user) res.redirect("/userLogin");
        else {
            if (await userModel.findOne({ email: userDetails.email })) {
                res.render("/userRegister", { message: "Email id already exists" });
                req.session.user = false;
                if (await userModel.findOne({ phone: userDetails.phone })) {
                    res.render("/userRegister", { message: "Phone number already exists" });
                } else {
                    let userData = await bcrypt.hash(userDetails.password, 10);
                }
            } else {
                await userModel.create(userDetails);
                req.session.user = true;
                res.render("/userHome");
            }
        }
    } catch (error) {
        next(error);
    }
    // res.render("user/userLogin");
});

module.exports = router;
