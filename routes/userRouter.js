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
    personalAddressPost,
    cart,
    addToCartHome,
    addToCartShop,
    quantityChange,
    deleteCart,
    updateAddress,
    checkout,
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

router.get("/address", sessionCheck, personalAddress);

router.post("/address_post", personalAddressPost);

router.post("/address_update", updateAddress);

router.get("/cart/:id", sessionCheck, cart);

router.post("/add_to_cart_home", sessionCheck, addToCartHome);

router.post("/add_to_cart_shop", sessionCheck, addToCartShop);

router.post("/quantity_change", sessionCheck, quantityChange);

router.delete("/delete_cart", deleteCart);

router.get("/checkout", checkout);

router.get("/logout", logout);

module.exports = router;
