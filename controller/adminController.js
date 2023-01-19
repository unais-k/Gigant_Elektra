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
    // if (categoryCheck) {
    //     console.log("category already exist ");
    //     // await categoryModel.updateOne({ categoryname: categoryname }, { $push: { vendor: { $each: [vendor] } } });
    //     // await categoryModel.updateOne({ categoryname: categoryname }, { $push: { Brand: vendor } });
    //     res.render("admin/addCategory", { message: "category already exist" });
    // } else {
    //     next();

    // }
    if (categoryCheck) {
        console.log("2nd if");
        res.render("admin/addCategory", { message: "category already exist" });
    } else {
        await categoryModel.create({
            categoryname: categoryname,
            description: categoryDescription,
            Brand: vendor,
        });
        console.log("category added");
        res.render("admin/addCategory", { message: false });
    }
};

const showProducts = async (req, res) => {
    let productList = await productModel.find({});
    let categoryList = await categoryModel.find({});
    res.render("admin/showProducts", { productList, categoryList });
};

const addProduct = async (req, res) => {
    // let productList = await productModel.find({});
    let categoryList = await categoryModel.find({});
    res.render("admin/addProducts", { categoryList, message: false });
};

const addProductPost = async (req, res, next) => {
    console.log(req.body);
    try {
        let imageName = req.files;
        let img = [];
        for (let i = 0; i < imageName.length; i++) {
            img[i] = imageName[i].path.substring(6);
        }
        console.log(imageName);
        const body = req.body;
        // Object.assign(body, { productImages: img });

        let done = await productModel.create({
            productImages: img,
            productName: body.productname,
            price: body.price,
            brand: body.brand,
            details: body.details,
            category: body.category,
            quantity: body.quantity,
            color: body.color,
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
    } catch (error) {
        console.log(error);
    }
};

const showBrand = async (req, res) => {
    let brand = req.query.brand;
    let product = await productModel.find({ Brand: brand });
    let category = await categoryModel.find({});
    res.render("admin/showBrand", { product, category });
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
    let done = await productModel.findById({ _id: productDelete });
    console.log(done);
    if (done) {
        let block = await productModel.updateOne({ _id: productDelete }, { $set: { delete: false } });
        let productList = await productModel.find({});
        let categoryList = await categoryModel.find({});
        res.render("admin/showProducts", { productList, categoryList });
    } else {
        res.redirect("/admin/products");
    }
};

const activateProduct = async (req, res) => {
    let productDelete = req.params.id;
    let done = await productModel.findById({ _id: productDelete });
    console.log(done);
    if (done) {
        let block = await productModel.updateOne({ _id: productDelete }, { $set: { delete: true } });
        let productList = await productModel.find({});
        let categoryList = await categoryModel.find({});
        res.render("admin/showProducts", { productList, categoryList });
    } else {
        res.redirect("/admin/products");
    }
};

const actionFalse = async (req, res, next) => {
    let action = req.params.id;
    let block = await userModel.updateOne({ _id: action }, { $set: { block: false } });
    if (block) {
        res.redirect("/admin/customers");
    } else {
        res.redirect("/admin");
    }
    // try {
    //     let id = req.params.id;
    //     let response;
    //     let action = await userModel.findById({ _id: id });
    //     if (action) {
    //         userModel
    //             .updateOne({ _id: id }, { $set: { block: false } })
    //             .then(() => {
    //                 res.json({ response: true });
    //             })
    //             .catch((error) => next(error));
    //     }
    // } catch (error) {
    //     next(error);
    // }
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
    res.render("admin/editCategory", { categoryId, message: false });
};

const deleteCategory = async (req, res) => {
    let categoryinfo = req.params.id;
    let detail = await categoryModel.findByIdAndDelete({ _id: categoryinfo });
    res.redirect("/admin/category");
};

const detail_prdouct = async (req, res) => {
    let findId = req.params.id;
    let editProduct = await productModel.findOne({ _id: findId });
    let categoryList = await categoryModel.find({});
    console.log(editProduct);
    res.render("admin/productDetails", { editProduct, categoryList });
};

const updateProduct = async (req, res) => {
    // let body = req.body;
    // let productId = req.params.id;
    // let image = req.files;
    // if (image == 0) {
    //     Object.assign(body);
    //     await productModel.findByIdAndUpdate(productId, { $set: body });
    //     res.redirect("/admin/products");
    // } else {
    //     let img = [];
    //     for (let i = 0; i < image.length; i++) {
    //         img[i] = image[i].path.substring(6);
    //     }
    //     await productModel.findByIdAndUpdate(productId, { $set: body });
    // }
    console.log(234567);
    let ID = req.params.id;
    console.log(ID);
    let productID = await productModel.findOne({ _id: ID });
    console.log(productID);
    let categoryList = await categoryModel.find({});
    res.render("admin/productEdit", { productID, categoryList });
};

const updatedProduct = async (req, res) => {
    let body = req.body;
    console.log(body);
    let productId = req.params.id;
    let image = req.files;
    console.log(image);

    if (image == 0) {
        Object.assign(body);
        await productModel.findByIdAndUpdate(productId, { $set: body });
        res.redirect("/admin/products");
    } else {
        let img = [];
        for (let i = 0; i < image.length; i++) {
            img[i] = image[i].path.substring(6);
        }
        let done = await productModel.updateOne(
            { _id: productId },
            {
                productImages: img,
                productName: body.productname,
                price: body.price,
                brand: body.brand,
                details: body.details,
                category: body.category,
                quantity: body.quantity,
                color: body.color,
            }
        );
        res.redirect("/admin/products");
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect("/admin");
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
    activateProduct,
    customers,
    actionFalse,
    actionTrue,
    editCategory,
    detail_prdouct,
    deleteCategory,
    updateProduct,
    updatedProduct,
    logout,
};
