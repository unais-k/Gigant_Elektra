const { response } = require("express");
var express = require("express");
var router = express.Router();
const categoryModel = require("../models/categorySchema");
const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const { productPhoto } = require("../middleware/multer");
// const vendorModel = require("../models/vendorSchema");

const adminLogin = (req, res) => {
    res.render("admin/adminLogin", { message: false });
};

const adminLoginPost = (req, res, next) => {
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
};

const adminHome = (req, res) => {
    res.render("admin/adminHome");
};

const category = async (req, res) => {
    let categoryList = await categoryModel.find({});
    res.render("admin/category", { categoryList });
};

const addCategory = (req, res) => {
    // const category = categoryModel.find({});
    res.render("admin/addCategory", { message: false });
};

const addCategoryPost = async (req, res, next) => {
    const categoryname = req.body.category;
    const categoryDescription = req.body.description;
    const vendor = req.body.checkbox;
    console.log(req.body);
    let categoryCheck = await categoryModel.findOne({ categoryname: categoryname });
    // let vendorname = await categoryModel.findOne({ vendor: vendor });
    console.log("category adding");
    if (categoryCheck) {
        console.log("vendor adding");
        // await categoryModel.updateOne({ categoryname: categoryname }, { $push: { vendor: { $each: [vendor] } } });
        await categoryModel.updateOne({ categoryname: categoryname }, { $push: { vendor: vendor } });
    } else {
        next();
    }
    if (categoryCheck) {
        console.log("2nd if");
        res.render("admin/addCategory", { message: "category already exist" });
    } else {
        await categoryModel.create({
            categoryname: categoryname,
            description: categoryDescription,
            vendor: vendor,
        });
        console.log("category added");
        res.redirect("/admin/addCategory");
    }
};

const showProducts = async (req, res) => {
    let productList = await productModel.find({});
    res.render("admin/showProducts", { productList });
};

const addProduct = async (req, res) => {
    // let productList = await productModel.find({});
    let categoryList = await categoryModel.find({});
    res.render("admin/addProducts", { categoryList, message: false });
};

const addProductPost = async (req, res, next) => {
    console.log(req.body);
    let img = req.file.thumbnail;
    let imageName = req.files;
    const productInfo = req.body;
    Object.assign(productInfo, { productImages: imageName });
    let done = await productModel.create({
        thumbnail: img,
        productImages: imageName,
        productName: productInfo.productname,
        price: productInfo.price,
        vendor: productInfo.vendor,
        details: productInfo.details,
        category: productInfo.category,
        quantity: productInfo.quantity,
        color: productInfo.color,
    });
    if (done) {
        let categoryList = await categoryModel.find({});
        res.render("admin/addProducts", { categoryList, message: false });
    } else {
        message = "Photo don't added";
        console.log("product post failed");
        let categoryList = await categoryModel.find({});
        res.render("admin/addProducts", { categoryList, message });
    }
};

const productDetails = (req, res) => {
    res.render("admin/productDetails");
};

const customers = async (req, res) => {
    let userList = await userModel.find({});

    res.render("admin/customers", { userList });
};

const deleteProduct = async (req, res) => {
    let productDelete = req.params.id;
    let done = await productModel.softDelete({ _id: productDelete });
    if (done) {
        let productList = await productModel.find({});
        let categoryList = await categoryModel.find({});
        res.render("admin/showProducts", { productList, categoryList });
    } else {
        res.redirect("/admin/products");
    }
};

const actionFalse = async (req, res) => {
    let action = req.params.id;
    let block = await userModel.updateOne({ _id: action }, { $set: { block: false } });
    if (block) {
        res.redirect("/admin/customers");
    } else {
        res.redirect("/admin");
    }
};

const actionTrue = async (req, res) => {
    let action = req.params.id;
    let block = await userModel.updateOne({ _id: action }, { $set: { block: true } });
    if (block) {
        res.redirect("/admin/customers");
    } else {
        res.redirect("/admin");
    }
};

const editCategory = async (req, res) => {
    let findId = req.params.id;
    let categoryId = await categoryModel.findOne({ _id: findId });
    res.render("admin/addCategory", { categoryId, message: false });
};

const edit_prdouct = async (req, res) => {
    let findId = req.params.id;
    let editProduct = await categoryModel.findOnea({ _id: findId });
    let categoryList = await categoryModel.find({});
    res.render("admin/productDetails", { editProduct, categoryList });
};

module.exports = {
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
};
