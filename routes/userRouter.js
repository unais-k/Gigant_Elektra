var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
// const { user_login } = require("../middleware/userLogin");
const { sessionCheck } = require("../middleware/userLogin");
const userModel = require("../models/userSchema");
// const { uploadProfile } = require("../middleware/multer");
// const { otpCalling, otpVeryfication } = require("../config/otp");
const {
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
    addToCart,
} = require("../controller/userController");

/* GET home page. */
router.get("/", userHome);

router.get("/login", userLogin);

router.post("/userLogin", userLoginPost);

router.get("/userRegister", userRegister);

router.post("/userRegisterPost", userRegisterPost);

router.get("/userProduct", userProduct);

// router.get("/productDetails", userProductDetails);

router.get("/productDetails/:id", showProductDetails);

router.get("/profile/:id", sessionCheck, profile);

router.get("/wishlist", sessionCheck, wishList);

router.post("/otp_verify", otpVerify);

router.post("/otp_verifyied", otpVerifyPost);

router.get("/personal_address", personalAddress);

router.get("/cart/:id", sessionCheck, cart);

router.get("/add_to_cart:id", sessionCheck, addToCart);

router.get("/logout", logout);

module.exports = router;
