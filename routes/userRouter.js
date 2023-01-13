var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");
const { uploadProfile } = require("../models/multer");
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
router.post("/userRegisterPost", uploadProfile, async (req, res, next) => {
    const userDetails = {
        userName: req.body.fullname,
        userId: req.body.username,
        phone: req.body.phone,
        userEmail: req.body.email,
        password: req.body.password,
    };
    console.log(req.body);
    try {
        if (req.session.user) res.redirect("/userLogin");
        else {
            if (await userModel.findOne({ userEmail: userDetails.userEmail })) {
                res.render("/userRegister", { message: "Email id already exists" });
                req.session.user = false;
            } else {
                if (await userModel.findOne({ phone: userDetails.phone })) {
                    res.render("/userRegister", { message: "Phone number already exists" });
                } else {
                    if (req.body.password == req.body.confirmpassword) {
                        userDetails.password = await bcrypt.hash(userDetails.password, 10);
                        console.log("password hashing");
                        console.log(userDetails.password);
                        await userModel.create({
                            userName: req.body.fullname,
                            userId: req.body.username,
                            userEmail: req.body.email,
                            phone: req.body.phone,
                            password: userDetails.password,
                            userImage: req.file.filename,
                        });
                        // req.session.user = true;
                        res.redirect("/");
                    } else {
                        console.log("error in password hasing");
                        res.render("/userRegister", { message: "please check password again" });
                    }
                }
            }
        }
    } catch (error) {
        next(error);
    }
    // res.render("user/userLogin");
});

module.exports = router;
