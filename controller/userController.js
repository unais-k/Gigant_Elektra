var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");

const productModel = require("../models/productSchema");
const { sendotp, verifyotp } = require("../config/otp");
const { response } = require("express");
const cartModel = require("../models/cartSchema");

const userLogin = (req, res) => {
    if (req.session.user_login) {
        res.render("user/userprofile", { message: false });
    } else {
        req.session.user_loginError = true;
        res.render("user/userLogin", { message: false });
    }
    // res.render("user/userLogin", { message: false });
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
    if (req.session.user_login) res.redirect("/");
    else res.render("user/userRegister", { message: false });
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
    if (req.session.user_login) {
        res.redirect("/login");
    } else {
        req.session.user_login = req.body;
        if (await userModel.findOne({ userEmail: userDetails.userEmail })) {
            res.render("user/userRegister", { message: "Email id already exists" });
        } else {
            if (await userModel.findOne({ phone: userDetails.phone })) {
                res.render("user/userRegister", { message: "Phone number already exists" });
            } else {
                if (req.body.password == req.body.confirmpassword) {
                    // req.session.user_login = req.body;
                    // console.log("post register");
                    // console.log(req.session.user_login);
                    // sendotp(userDetails.phone);
                    // console.log("send otp");
                    // res.render("user/otpverify");
                    // this was code if otp ready
                    console.log(req.body);
                    const hashedpassword = await bcrypt.hash(userDetails.password, 10);
                    let userData = req.session.user_login;
                    await userModel.create({
                        userName: userData.fullname,
                        userId: userData.username,
                        userEmail: userData.email,
                        phone: userData.phone,
                        password: hashedpassword,
                    });
                    console.log("userData saved");
                    req.session.otpverifyed = true;
                    res.redirect("/");
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
    let userData = req.session.user_login;
    console.log(userData);
    console.log(req.session.user_login + " req");
    const password = req.session.user_login.password;
    const phone = req.session.user_login.phone;
    const otp = req.body.otp;
    console.log(phone);
    console.log(otp);
    await verifyotp(phone, otp).then(async (varification_check) => {
        if (varification_check.status == "approved") {
            const hashedpassword = await bcrypt.hash(password, 10);
            let userData = req.session.user_login;
            await userModel.create({
                userName: userData.fullname,
                userId: userData.username,
                userEmail: userData.email,
                phone: userData.phone,
                password: hashedpassword,
            });
            console.log("userData saved");
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

const userHome = async (req, res, next) => {
    let productList = await productModel.find({});
    user_details = req.session.user_login;
    console.log(user_details);
    res.render("user/userHome", { user_details, productList });
};

const profile = async (req, res) => {
    if (req.session.user_login) {
        let userId = req.params.id;
        let user_details = await userModel.findOne({ _id: userId });
        res.render("user/profile", { user_details });
    } else {
        console.log("profile error");
        res.redirect("/userLogin");
    }
};

const wishList = (req, res) => {
    if (req.session.user_login) {
        res.render("user/wishlist");
    } else {
        console.log("profile error");
        res.redirect("/userLogin");
    }
    // res.render("user/wishlist");
};

const personalAddress = (req, res) => {
    res.render("user/userAddress");
};

const cart = async (req, res) => {
    let userId = req.session.user_login;
    let fullcart = await cartModel.find({ owner: userId });
    console.log(fullcart.items);
    if (fullcart) {
        let fulldata = await cartModel.find({ owner: userId }).populate("items.product", "productName productImages price");
        console.log(fulldata);
        res.render("user/cart", { fulldata });
    } else {
        res.redirect("/login");
    }
};

const addToCartHome = async (req, res) => {
    let userID = req.session.user_login;
    let productId = req.params.id;
    console.log(productId);
    let productInfo = await productModel.findById({ _id: productId });
    let cartInfo = await cartModel.create({
        owner: req.session.user_login._id,
        items: [
            {
                product: productInfo._id,
                totalPrice: productInfo.price,
            },
        ],
        cartPrice: productInfo.price,
    });
    // let addtoUser = await userModel.updateOne(
    //     { _id: userID._id },
    //     { $push: { product: { productId: productInfo._id, productStatus: true } } }
    // );
    console.log(cartInfo);
    console.log("added to cart from home");
    // res.render("user/cart", { productInfo });
    res.redirect("/");
};

const addToCartShop = async (req, res) => {
    let productId = req.params.id;
    console.log(productId);
    let productInfo = await productModel.findById({ _id: productId });
    let cartInfo = await cartModel.create({
        owner: req.session.user_login._id,
        items: [
            {
                product: productId,
                quantity: productId.quantity,
                totalPrice: productId.price,
            },
        ],
        cartPrice: productInfo.price,
    });
    console.log(cartInfo);
    // res.render("user/cart", { productInfo });
    res.redirect("/");
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect("/");
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
    cart,
    addToCartHome,
    addToCartShop,
};
