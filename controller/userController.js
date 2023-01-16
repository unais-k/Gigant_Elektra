var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");
const uploadProfile = require("../middleware/multer");
const productModel = require("../models/productSchema");
const { sendotp, verifyotp } = require("../config/otp");
const { response } = require("express");

const userHome = async (req, res, next) => {
    if (req.session.user_login) {
        let user = req.session.user_login._id;
        let userId = await userModel.findOne({ _id: user });
        res.render("user/userHome", { userId });
    } else {
        res.render("user/userHome");
    }
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
            req.session.user_login = true;
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
    if (req.session.user_loginError) res.render("user/userRegister", { message: false });
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
                        req.session.user_login = true;
                        res.redirect("/");
                    } else {
                        console.log("error in password hasing");
                        req.session.user_loginError = true;
                        res.render("/userRegister", { message: "please check password again" });
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
            res.render("/userRegister", { message: "Email id already exists" });
        } else {
            if (await userModel.findOne({ phone: userDetails.phone })) {
                res.render("/userRegister", { message: "Phone number already exists" });
            } else {
                if (req.body.password == req.body.confirmpassword) {
                    // userDetails.password = await bcrypt.hash(userDetails.password, 10);
                    // console.log("password hashing");
                    // console.log(userDetails.password);
                    // await userModel.create({
                    //     userName: req.body.fullname,
                    //     userId: req.body.username,
                    //     userEmail: req.body.email,
                    //     phone: req.body.phone,
                    //     password: userDetails.password,
                    //     userImage: req.file.filename,
                    // });
                    // // req.session.user = true;
                    req.session.user_signup = req.body;
                    sendotp(phone);
                    res.render("user/otpverify");
                } else {
                    console.log("error in password hasing");
                    req.session.user_loginError = true;
                    res.render("/userRegister", { message: "please check password again" });
                }
            }
        }
    }
};

const otpVerifyPost = async (req, res) => {
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
            userData.save().then(response);

            // console.log("otp verifying");
            // userdata = usersignupdb({
            //     fullname: user_name,
            //     email: user_email,
            //     user
            //     mobilenumber: phone,
            //     password: hashedpassword,
            // });
            // userdata.save().then((response) => {
            //     req.session.user_detail = response;
            // });

            req.session.otpverifyed = true;
            res.redirect("/");
        } else {
            req.send("otp error", "otp not match");
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
        let user = req.session.user_login._id;
        console.log("user id");
        let userId = await userModel.find({ _id: user });

        res.render("user/profile", { userId });
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
};
