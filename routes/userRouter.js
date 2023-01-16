var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");
const { uploadProfile } = require("../middleware/multer");
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
} = require("../controller/userController");

/* GET home page. */
router.get("/", userHome);

router.get("/userLogin", userLogin);

router.post("/userLogin", userLoginPost);

router.get("/userRegister", userRegister);

router.post("/userRegisterPost", uploadProfile, userRegisterPost);

router.get("/userProduct", userProduct);

// router.get("/productDetails", userProductDetails);

router.get("/productDetails/:id", showProductDetails);

module.exports = router;
