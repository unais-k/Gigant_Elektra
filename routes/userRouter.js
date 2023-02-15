var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
// const { user_login } = require("../middleware/userLogin");
const { sessionCheck } = require("../middleware/auth");
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
    // addToCartHome,
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
    paymentPost,
    success,
    coponCheck,
    orderView,
    orderDetails,
    orderViewCheck,
    createorder,
    verifyPaypal,
    cancelOrder,
    forgotPassword,
    forgorpasswordPost,
    otpforgotverify,
    changePassword,
    otpPage,
    search,
} = require("../controller/userController");

/* GET home page. */
router.get("/", userHome);

router.get("/login", userLogin);

router.post("/userLogin", userLoginPost);

router.get("/userRegister", userRegister);

router.post("/userRegisterPost", userRegisterPost);

router.get("/userProduct", userProduct);

router.post("/search", search);

// router.get("/productDetails", userProductDetails);

router.get("/productDetails", showProductDetails);

router.get("/profile", sessionCheck, profile);

router.get("/wishlist", sessionCheck, wishlist);

router.post("/add_to_wishlist", sessionCheck, addToWishlist);

router.delete("/delete_wishlist", sessionCheck, deleteWishlist);

router.post("/otp_verify", otpVerify);

router.get("/otp", otpPage);

router.post("/otp_verifyied", otpVerifyPost);

router.get("/address", sessionCheck, personalAddress);

router.post("/address_post", sessionCheck, personalAddressPost);

router.post("/edit_address", sessionCheck, editAddress);

router.post("/address_first", sessionCheck, firstAddress);

router.delete("/delete_address/:id", sessionCheck, deleteAddress);

router.get("/cart", sessionCheck, cart);

router.post("/couponCheck", sessionCheck, coponCheck);

router.post("/add_to_cart_shop", sessionCheck, addToCartShop);

router.post("/quantity_change", sessionCheck, quantityChange);

router.delete("/delete_cart", sessionCheck, deleteCart);

router.get("/checkout", sessionCheck, checkout);

router.get("/address_confirm", sessionCheck, shipping);

router.post("/shipping_charge", sessionCheck, shippingCharge);

router.get("/payment", sessionCheck, payment);

router.post("/order_post", sessionCheck, paymentPost);

router.post("/create-order", sessionCheck, createorder);

router.post("/paypal_post", sessionCheck, verifyPaypal);

router.get("/order_review", sessionCheck, checkoutReview);

router.get("/success", sessionCheck, success);

router.get("/order_view", sessionCheck, orderView);

router.post("/order_view_check", sessionCheck, orderViewCheck);

router.get("/order_details/:id", sessionCheck, orderDetails);

router.post("/cancel_order", sessionCheck, cancelOrder);

router.get("/forgot_password", forgotPassword);

router.post("/forgot_password_post", forgorpasswordPost);

router.post("/otpforgotPost", otpforgotverify);

router.patch("/changePassword", changePassword);

router.get("/logout", logout);

module.exports = router;
