var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");
const uploadProfile = require("../middleware/multer");
const productModel = require("../models/productSchema");

const userHome = (req, res, next) => {
    res.render("user/userHome");
};

const userLogin = (req, res) => {
    res.render("user/userLogin", { message: false });
};

const userLoginPost = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    let userId = await userModel.findOne({ userId: username });
    let pass = await userModel.findOne({ password: password });
    if (userId) {
        if (pass) {
            req.session.user = true;
            res.render("user/userHome");
        } else {
            res.render("user/userLogin", { message: "Password error" });
        }
    } else {
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

module.exports = {
    userHome,
    userLogin,
    userRegister,
    userRegisterPost,
    userLoginPost,
    userProduct,
    // userProductDetails,
    showProductDetails,
};
