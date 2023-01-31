const { response } = require("express");
var express = require("express");
var router = express.Router();
const categoryModel = require("../models/categorySchema");
const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const { productPhoto } = require("../middleware/multer");

const {
    adminLogin,
    adminLoginPost,
    adminHome,
    category,
    addCategory,
    addCategoryPost,
    showProducts,
    addProduct,
    addProductPost,
    productDetails,
    deleteProduct,
    activateProduct,
    customers,
    actionFalse,
    actionTrue,
    editCategory,
    updateProduct,
    detail_prdouct,
    updatedProduct,
    logout,
    addCoupon,
    coupon,
    addCouponPost,
    deleteCoupon,
    activeCoupon,
    revokeCoupon,
} = require("../controller/adminController");

router.get("/", adminLogin);

router.post("/adminLogin", adminLoginPost);

router.get("/adminHome", adminHome);

router.get("/category", category);

router.get("/addCategory", addCategory);

router.post("/addCategoryPost", addCategoryPost);

router.get("/products", showProducts);

router.get("/addProducts", addProduct);

router.post("/addProductPost", productPhoto, addProductPost);

router.get("/productDetails", productDetails);

router.get("/customers", customers);

// router.get("/editProduct/:id", editProduct);

router.get("/delete_product/:id", deleteProduct);

router.get("/activate_product/:id", activateProduct);

router.get("/actionFalse/:id", actionFalse);

router.get("/actionTrue/:id", actionTrue);

router.get("/edit_category/:id", editCategory);

router.get("/delete_category/:id", deleteProduct);

router.get("/detail_product/:id", detail_prdouct);

router.get("/update_product/:id", updateProduct);

router.post("/updated_product/:id", productPhoto, updatedProduct);

router.get("/coupon", coupon);

router.get("/addCoupon", addCoupon);

router.post("/addCoupon_post", addCouponPost);

router.post("/active_coupon/:id", activeCoupon);

router.post("/revoke_coupon/:id", revokeCoupon);

router.delete("/delete_coupon", deleteCoupon);

router.get("/logout", logout);

module.exports = router;
