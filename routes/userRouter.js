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
    wishlist,
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
    checkout,
    editAddress,
    deleteAddress,
    firstAddress,
    shipping,
    payment,
    shippingCharge,
    checkoutReview,
    deleteWishlist,
    addToWishlist,
    editingAddress,
    paymentPost,
    success,
    coponCheck,
} = require("../controller/userController");

/* GET home page. */
router.get("/", userHome);

router.get("/login", userLogin);

router.post("/userLogin", userLoginPost);

router.get("/userRegister", userRegister);

router.post("/userRegisterPost", userRegisterPost);

router.get("/userProduct", userProduct);

// router.get("/productDetails", userProductDetails);

router.get("/productDetails", showProductDetails);

router.get("/profile/:id", sessionCheck, profile);

router.get("/wishlist", sessionCheck, wishlist);

router.post("/add_to_wishlist", sessionCheck, addToWishlist);

router.delete("/delete_wishlist", deleteWishlist);

router.post("/otp_verify", otpVerify);

router.post("/otp_verifyied", otpVerifyPost);

router.get("/address", sessionCheck, personalAddress);

router.post("/address_post", sessionCheck, personalAddressPost);

router.post("/edit_address", sessionCheck, editAddress);

router.post("/editing_address/:id", sessionCheck, editingAddress);

router.post("/address_first", sessionCheck, firstAddress);

router.delete("/delete_address/:id", sessionCheck, deleteAddress);

router.get("/cart/:id", sessionCheck, cart);

router.post("/couponCheck", sessionCheck, coponCheck);

router.post("/add_to_cart_home", sessionCheck, addToCartHome);

router.post("/add_to_cart_shop", sessionCheck, addToCartShop);

router.post("/quantity_change", sessionCheck, quantityChange);

router.delete("/delete_cart", deleteCart);

router.get("/checkout/:id", sessionCheck, checkout);

router.get("/address_confirm/:id", sessionCheck, shipping);

router.post("/shipping_charge", shippingCharge);

router.get("/payment", sessionCheck, payment);

router.post("/order_post", sessionCheck, paymentPost);

router.get("/order_review", sessionCheck, checkoutReview);

router.get("/success", sessionCheck, success);

router.get("/logout", logout);

module.exports = router;
