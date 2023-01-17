var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");

const productModel = require("../models/productSchema");
const { sendotp, verifyotp } = require("../config/otp");
const { response } = require("express");

const userHome = async (req, res, next) => {
    user_details = req.session.user_login;
    res.render("user/userHome", { user_details });
};

const userLogin = (req, res) => {
    if (req.session.user_login) {
        res.render("user/userprofile", { message: false });
    } else {
        req.session.user_loginError = true;
        res.render("user/userLogin", { message: false });
    }
};

const userLoginPost = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    let userId = await userModel.findOne({ userId: username });
    if (userId) {
        let pass = bcrypt.compare(password, userId.password);
        if (pass) {
            req.session.user_login = userId;
            res.redirect("/");
        } else {
            req.session.user_loginError = true;
            res.render("user/userLogin", { message: "Password error" });
        }
    } else {
        req.session.user_loginError = true;
        res.render("user/userLogin", { message: "username error" });
    }
    // res.render("user/userHome");
};

const userRegister = (req, res, next) => {
    res.render("user/userRegister", { message: false });
};

const userRegisterPost = async (req, res, next) => {
    const userDetails = {
        userName: req.body.fullname,
        userId: req.body.username,
        phone: req.body.phone,
        userEmail: req.body.email,
        password: req.body.password,
    };

    try {
        if (req.session.user_login) res.redirect("/userLogin");
        else {
            if (await userModel.findOne({ userEmail: userDetails.userEmail })) {
                res.render("user/userRegister", { message: "Email id already exists" });
            } else {
                if (await userModel.findOne({ phone: userDetails.phone })) {
                    res.render("user/userRegister", { message: "Phone number already exists" });
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
                        req.session.user_login = user;
                        res.redirect("/");
                    } else {
                        console.log("error in password hasing");
                        req.session.user_loginError = true;
                        res.render("user/userRegister", { message: "please check password again" });
                    }
                }
            }
        }
    } catch (error) {
        next(error);
    }
    // res.render("user/userLogin");
};

const otpVerify = async (req, res, next) => {
    const userDetails = {
        userName: req.body.fullname,
        userId: req.body.username,
        phone: req.body.phone,
        userEmail: req.body.email,
        password: req.body.password,
    };
    console.log(req.body);
    if (req.session.user) res.redirect("/userLogin");
    else {
        if (await userModel.findOne({ userEmail: userDetails.userEmail })) {
            res.render("user/userRegister", { message: "Email id already exists" });
        } else {
            if (await userModel.findOne({ phone: userDetails.phone })) {
                res.render("user/userRegister", { message: "Phone number already exists" });
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
                    });
                    req.session.user_login = req.body;
                    res.redirect("/");
                    // // req.session.user = true;
                    // req.session.user_signup = req.body;
                    // console.log("post register");
                    // console.log(req.session.user_signup);
                    // sendotp(userDetails.phone);
                    // console.log("send otp");
                    // res.render("user/otpverify");
                } else {
                    console.log("error in password hasing");
                    req.session.user_loginError = true;
                    res.render("user/userRegister", { message: "please check password again" });
                }
            }
        }
    }
};

const otpVerifyPost = async (req, res) => {
    console.log(req.session.user_signup);
    const { user_name, user_email, password, phone, user_id } = req.session.user_signup;
    const otp = req.body.otp;
    console.log(phone);
    console.log(otp);
    await verifyotp(phone, otp).then(async (varification_check) => {
        if (varification_check.status == "approved") {
            console.log(password, confirmpassword);
            const hashedpassword = await bcrypt.hash(password, 10);

            userData = userModel({
                userName: user_name,
                userId: user_id,
                userEmail: user_email,
                phone: phone,
                password: hashedpassword,
            });
            userData.save().then((response) => {
                req.session.user_login = response;
            });
            req.session.otpverifyed = true;
            res.redirect("/");
        } else {
            req.send("otp error", "otp not match");

            req.redirect("/otp_verify");
        }
    });
};

const userProduct = async (req, res) => {
    let productList = await productModel.find({});
    res.render("user/userProducts", { productList });
};

// const userProductDetails = async (req, res) => {
//     let productList = await productModel.find({});
//     res.render("user/productDetails", { productList });
// };

const showProductDetails = async (req, res) => {
    let productID = req.params.id;
    let productList = await productModel.findOne({ _id: productID });
    if (productList) {
        res.render("user/productDetails", { productList });
    } else {
        res.redirect("/userPoduct");
    }
};

const profile = async (req, res) => {
    if (req.session.user_login) {
        res.render("user/profile");
    } else {
        console.log("profile error");
        res.redirect("/userLogin");
    }
};

const wishList = (req, res) => {
    res.render("user/wishlist");
};

const logout = (req, res) => {
    req.session.destroy();
    res.render("/");
};

const personalAddress = (req, res) => {
    res.render("user/userAddress");
};

module.exports = {
    userHome,
    userLogin,
    userRegister,
    userRegisterPost,
    userLoginPost,
    userProduct,
    // userProductDetails,
    showProductDetails,
    profile,
    wishList,
    logout,
    otpVerify,
    otpVerifyPost,
    personalAddress,
};
