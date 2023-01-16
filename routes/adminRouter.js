const { response } = require("express");
var express = require("express");
var router = express.Router();
const categoryModel = require("../models/categorySchema");
const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const { productPhoto, thumbnail } = require("../middleware/multer");

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
    customers,
    actionFalse,
    actionTrue,
    editCategory,
    edit_prdouct,
} = require("../controller/adminController");

router.get("/", adminLogin);

router.post("/adminLogin", adminLoginPost);

router.get("/adminHome", adminHome);

router.get("/category", category);

router.get("/addCategory", addCategory);

router.post("/addCategoryPost", addCategoryPost);

router.get("/products", showProducts);

router.get("/addProducts", addProduct);

router.post("/addProductPost", productPhoto, thumbnail, addProductPost);

router.get("/productDetails", productDetails);

router.get("/customers", customers);

// router.get("/editProduct/:id", editProduct);

router.get("/deleteProduct/:id", deleteProduct);

router.get("/actionFalse/:id", actionFalse);

router.get("/actionTrue/:id", actionTrue);

router.get("/edit_category/:id", editCategory);

router.get("/edit_product/:id", edit_prdouct);

module.exports = router;
