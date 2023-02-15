const { response } = require("express");
var express = require("express");
var router = express.Router();
const categoryModel = require("../models/categorySchema");
const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const { productPhoto, editPhoto } = require("../middleware/multer");

const { adminSession } = require("../middleware/auth");

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
    order,
    orderDetails,
    paymentStatus,
    addBanner,
    banner,
    graph,
    report,
    weekly,
    sales,
    dailly,
    cateFind,
    addbannerPost,
    editBanner,
} = require("../controller/adminController");

router.get("/", adminLogin);

router.post("/adminLogin", adminLoginPost);

router.get("/adminHome", adminSession, adminHome);

router.get("/dashboardgraph", adminSession, graph);

router.get("/weekly", adminSession, weekly);

router.get("/category", adminSession, category);

router.get("/addCategory", adminSession, addCategory);

router.post("/addCategoryPost", adminSession, addCategoryPost);

router.get("/products", adminSession, showProducts);

router.get("/addProducts", adminSession, addProduct);

router.post("/addProductPost", adminSession, productPhoto, addProductPost);

router.post("/catefind", adminSession, cateFind);

router.get("/productDetails", adminSession, productDetails);

router.get("/customers", adminSession, customers);

router.get("/report", adminSession, report);

router.post("/salesresport", adminSession, sales);

router.post("/dailyreport", adminSession, dailly);

// router.get("/editProduct/:id", editProduct);

router.get("/delete_product/:id", adminSession, deleteProduct);

router.get("/activate_product/:id", adminSession, activateProduct);

router.get("/actionFalse/:id", adminSession, actionFalse);

router.get("/actionTrue/:id", adminSession, actionTrue);

router.get("/edit_category/:id", adminSession, editCategory);

router.get("/delete_category/:id", adminSession, deleteProduct);

router.get("/detail_product/:id", adminSession, detail_prdouct);

router.get("/update_product/:id", adminSession, updateProduct);

router.post("/updated_product/:id", adminSession, productPhoto, updatedProduct);

router.get("/coupon", adminSession, coupon);

router.get("/addCoupon", adminSession, addCoupon);

router.post("/addCoupon_post", adminSession, addCouponPost);

router.post("/active_coupon/:id", adminSession, activeCoupon);

router.post("/revoke_coupon/:id", adminSession, revokeCoupon);

router.delete("/delete_coupon", adminSession, deleteCoupon);

router.get("/order", adminSession, order);

router.get("/order_details/:id", adminSession, orderDetails);

router.post("/order_status_confirm", adminSession, paymentStatus);

router.get("/banner", banner);

router.get("/add_banner", addBanner);

router.post("/addBannerPost", editPhoto, addbannerPost);

router.post("/edit_banner", editPhoto, editBanner);

router.get("/logout", logout);

module.exports = router;
