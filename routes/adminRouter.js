const { response } = require("express");
var express = require("express");
var router = express.Router();
const categoryModel = require("../models/categorySchema");
const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const { productPhoto } = require("../models/multer");
/* GET users listing. */
router.get("/", (req, res) => {
    res.render("admin/adminLogin", { message: false });
});

router.post("/adminLogin", (req, res, next) => {
    const adminEmail = process.env.adminEmail;
    const adminPassword = process.env.adminPassword;
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body);
    if (email == adminEmail) {
        console.log("email true");
        if (password == adminPassword) {
            req.session.adminLogin = true;
            res.render("admin/adminHome");
        } else {
            console.log("password error");
            req.session.adminLoginError = true;
            res.render("admin/adminLogin", { message: "password error" });
        }
    } else {
        console.log("email error");
        req.session.adminLoginError = true;
        res.render("admin/adminLogin", { message: "email error" });
    }
});

router.get("/adminHome", (req, res) => {
    res.render("admin/adminHome");
});
router.get("/category", (req, res) => {
    res.render("admin/category");
});
router.get("/addCategory", (req, res) => {
    // const category = categoryModel.find({});
    res.render("admin/addCategory", { message: false });
});
router.post("/addCategoryPost", async (req, res, next) => {
    try {
        const categoryname = req.body.category;
        const categoryDescription = req.body.description;
        console.log(req.body);
        let categoryCheck = await categoryModel.findOne({ categoryname: categoryname });
        console.log("category adding");
        if (categoryCheck) {
            console.log(data);
            message = "This category already exists";
            res.redirect("/admin/addCategory");
            console.log("error");
        } else {
            await categoryModel.create({
                categoryname: categoryname,
                description: categoryDescription,
            });
            res.redirect("/admin/addCategory");
            console.log("category added");
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});
router.get("/products", (req, res) => {
    res.render("admin/showProducts");
});
router.get("/addProducts", async (req, res) => {
    // let productList = await productModel.find({});
    let categoryList = await categoryModel.find({});
    res.render("admin/addProducts", { categoryList, message: false });
});
router.post("/addProductPost", productPhoto.array("profile", 3), async (req, res, next) => {
    const { productname, category, price, quantity, color, details, vendor } = req.body;
    let imageName = req.files;
    let productImages = imageName.map((val) => val.filename);
    if (productImages) {
        await productModel.create({
            productImages: productImages,
            productName: productname,
            category: category,
            price: price,
            vendor: vendor,
            color: color,
            quantity: quantity,
            details: details,
        });
        res.render("admin/addProducts", { message: false });
    } else {
        message = "Photo don't added";
        console.log("product post failed");
        res.render("admin/addProducts", { message });
    }
});
router.get("/productDetails", (req, res) => {
    res.render("admin/productDetails");
});
router.get("/customers", async (req, res) => {
    let userList = await userModel.find({});
    res.render("admin/customers", { userList });
});
module.exports = router;
