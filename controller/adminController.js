const { response } = require("express");
var express = require("express");
var router = express.Router();
const categoryModel = require("../models/categorySchema");
const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const { productPhoto } = require("../middleware/multer");
const couponModel = require("../models/couponSchema");
const orderModel = require("../models/orderSchema");
const cartModel = require("../models/cartSchema");
const adminModel = require("../models/adminSchema");
// const vendorModel = require("../models/vendorSchema");
const flash = require("connect-flash");
const addressModel = require("../models/addressSchema");
const { default: mongoose } = require("mongoose");
const bannerModel = require("../models/bannerSchema");
const path = require("path");

const adminLogin = (req, res, next) => {
    res.render("admin/adminLogin", { message: false });
};

const adminLoginPost = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let response = null;
    let adminMod = await adminModel.findOne({ email: email, password: password });

    try {
        if (adminMod) {
            if (email == adminMod.email) {
                if (password == adminMod.password) {
                    req.session.adminLogin = true;
                    response = false;
                } else {
                    req.session.adminLoginError = true;
                    response = true;
                }
            } else {
                req.session.adminLoginError = true;
                response = true;
            }
        } else {
            response = true;
        }
        res.json({ response });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const adminHome = async (req, res, next) => {
    try {
        let user = await userModel.find({});
        let userTotal = user.length;
        let today = new Date(Date.now());
        let totalpro = await orderModel.find({}, { total: 1, _id: 0 });
        let salereport = await orderModel.aggregate([
            { $match: { order_status: { $eq: "Completed" } } },
            {
                $group: {
                    _id: {
                        Year: { $year: "$createdAt" },
                        Month: { $month: "$createdAt" },
                        Day: { $dayOfMonth: "$createdAt" },
                    },
                    Total: { $sum: "$cartTotal" },
                },
            },
            {
                $sort: { "_id.Year": 1, "_id.Month": 1, "_id.Day": 1 },
            },
        ]);
        const date = new Date();
        let month = date.getMonth();
        month = month + 1;
        const year = date.getFullYear();
        const day = date.getDate();
        let todaySale = await orderModel.aggregate([
            {
                $match: {
                    order_status: { $ne: "Cancelled" },
                },
            },
            {
                $addFields: {
                    Day: { $dayOfMonth: "$createdAt" },
                    Month: { $month: "$createdAt" },
                    Year: { $year: "$createdAt" },
                },
            },
            {
                $match: { Day: day, Year: year, Month: month },
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    total: { $sum: "$cartTotal" },
                },
            },
        ]);
        const monthlyreport = await orderModel.aggregate([
            {
                $match: { order_status: { $eq: "Completed" } },
            },
            {
                $group: {
                    _id: {
                        Year: { $year: "$createdAt" },
                        Month: { $month: "$createdAt" },
                    },
                    Total: { $sum: "$cartTotal" },
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        let yearlyTotal = await orderModel.aggregate([
            {
                $group: {
                    _id: {
                        Year: { $year: "$foryear" },
                    },
                    Total: { $sum: "$cartTotal" },
                },
            },
            {
                $sort: { "_id.Year": 1 },
            },
        ]);
        let totalqty = await orderModel.aggregate([
            {
                $group: {
                    _id: {
                        _id: null,
                    },
                    qty: { $sum: { $size: "$items.quantity" } },
                },
            },
        ]);
        let dateMonth = new Date();
        dateMonth = dateMonth.getMonth();
        dateMonth = dateMonth + 1;

        let thismonth = await orderModel.aggregate([
            {
                $addFields: { month: { $month: "$updatedAt" } },
            },
            {
                $match: { month: { $eq: dateMonth } },
            },
            {
                $group: {
                    _id: {
                        Month: { $month: "$updatedAt" },
                    },
                    Total: { $sum: "$cartTotal" },
                },
            },
        ]);
        const totalMonthSale = thismonth[0].Total;
        const totalMonthProfit = (totalMonthSale * 15) / 100;
        let monthlyTotal = await orderModel.aggregate([
            {
                $group: {
                    _id: {
                        Year: { $year: "$createdAt" },
                        Month: { $month: "$createdAt" },
                        // Day: { $dayOfMonth: "$createdAt" },
                    },
                    Total: { $sum: "$cartTotal" },
                    Quantity: { $sum: { $size: "$items.quantity" } },
                },
            },
            {
                $sort: { "_id.Year": -1, "_id.Month": -1 },
            },
        ]);
        let totalProfit = (yearlyTotal[0].Total * 15) / 100;
        res.render("admin/adminHome", {
            userTotal,
            monthlyTotal,
            totalProfit,
            totalMonthSale,
            totalMonthProfit,
            userTotal,
            yearlyTotal,
            totalqty,
        });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const graph = async (req, res, next) => {
    try {
        let DailySale = await orderModel.aggregate([
            {
                $group: {
                    _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } },
                    Total: { $sum: "$cartTotal" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.date": 1 } },
        ]);

        let dailysales = [];
        let dailyprofits = [];
        let datetata = [];

        for (let i = 0; i < DailySale.length; i++) {
            dailysales.push(DailySale[i].Total);
            dailyprofits.push((DailySale[i].Total * 15) / 100);
            datetata.push(DailySale[i]._id.date);
        }
        res.json({ status: true, dailyprofits, dailysales, datetata });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const weekly = async (req, res, next) => {
    try {
        let weeksale = await orderModel.aggregate([
            {
                $match: { order_status: { $eq: "Completed" } },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                    },
                    Total: { $sum: "$cartTotal" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.month": 1 } },
        ]);

        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const salesRep = weeksale.map((el) => {
            const newOne = { ...el };
            newOne._id.month = months[newOne._id.month - 1];
            return newOne;
        });
        res.json({ status: true, salesRep });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const report = async (req, res, next) => {
    try {
        let yearly = await orderModel.aggregate([
            {
                $match: { order_status: { $eq: "Completed" } },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$updatedAt" },
                    },
                    items: { $sum: { $size: "$items" } },
                    total: { $sum: "$cartTotal" },
                    count: { $sum: 1 },
                },
            },
        ]);
        res.render("admin/reports", { yearly });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const sales = async (req, res, next) => {
    try {
        let salesRe = await orderModel.aggregate([
            {
                $match: { order_status: { $eq: "Completed" } },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$updatedAt" },
                    },
                    items: { $sum: { $size: "$items" } },
                    total: { $sum: "$cartTotal" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.month": 1 } },
        ]);
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const salesRep = salesRe.map((el) => {
            const newOne = { ...el };
            newOne._id.month = months[newOne._id.month - 1];
            return newOne;
        });
        res.json({ salesRep, error: false });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const dailly = async (req, res, next) => {
    try {
        let daily = await orderModel.aggregate([
            { $match: { order_status: { $eq: "Completed" } } },
            {
                $group: {
                    _id: {
                        Year: { $year: "$updatedAt" },
                        Month: { $month: "$updatedAt" },
                        Day: { $dayOfMonth: "$updatedAt" },
                    },
                    Total: { $sum: "$cartTotal" },
                    items: { $sum: { $size: "$items" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.Year": -1, "_id.Month": 1, "_id.Day": 1 } },
        ]);
        console.log(daily, 111);
        res.json({ error: false, daily });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const category = async (req, res, next) => {
    try {
        let categoryList = await categoryModel.find({});
        res.render("admin/category", { categoryList });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const addCategory = (req, res, next) => {
    try {
        let message = req.flash("message");
        if (message) res.render("admin/addCategory", { message });
        else res.render("admin/addCategory", { message: false });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const addCategoryPost = async (req, res, next) => {
    try {
        const categoryDescription = req.body.description;
        const vendor = req.body.checkbox;
        const categoryname = req.body.category;
        let name = new RegExp(`^${categoryname}`, "i");
        let categoryCheck = await categoryModel.findOne({ categoryname: { $regex: name } });
        console.log(categoryCheck);
        console.log("category adding");
        if (categoryCheck) {
            req.flash("message", "Category already exist");
            res.redirect("/admin/addCategory");
        } else {
            await categoryModel.create({
                categoryname: categoryname,
                description: categoryDescription,
                Brand: vendor,
            });
            console.log("category added");
            req.flash("message", "new Category added");
            res.redirect("/admin/addCategory");
        }
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const showProducts = async (req, res, next) => {
    try {
        let sub = req.query.sub;
        let cat = req.query.cat;
        if (sub == "ALL" && cat) {
            let productList = await productModel.find({ category: cat }).sort({ _id: -1 });
            let categoryList = await categoryModel.find({});
            res.render("admin/showProducts", { productList, categoryList });
        } else if (sub && cat) {
            let productList = await productModel.find({ brand: sub, category: cat }).sort({ _id: -1 });
            let categoryList = await categoryModel.find({});
            res.render("admin/showProducts", { productList, categoryList });
        } else {
            let categoryList = await categoryModel.find({});
            let productList = await productModel.find({}).sort({ _id: -1 });
            res.render("admin/showProducts", { productList, categoryList });
        }
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const addProduct = async (req, res, next) => {
    try {
        let categoryList = await categoryModel.find({});
        res.render("admin/addProducts", { categoryList, message: false });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const cateFind = async (req, res, next) => {
    try {
        let asd = await categoryModel.findOne({ categoryname: req.body.value }, { Brand: 1, _id: 0 });
        res.json(asd);
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
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
        let done = await productModel.create({
            productImages: img,
            productName: body.productname,
            price: body.price,
            brand: body.brand,
            details: body.details,
            category: body.category.toUpperCase(),
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
        error.admin = true;
        next(error);
    }
};

const showBrand = async (req, res, next) => {
    try {
        let brand = req.query.brand;
        let product = await productModel.find({ Brand: brand });
        let category = await categoryModel.find({});
        res.render("admin/showBrand", { product, category });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const productDetails = (req, res, next) => {
    try {
        res.render("admin/productDetails");
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const customers = async (req, res, next) => {
    try {
        let userList = await userModel.find({});
        console.log(userList);
        res.render("admin/customers", { userList });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        let productDelete = req.params.id;
        let done = await productModel.findById({ _id: productDelete });
        if (done) {
            let block = await productModel.updateOne({ _id: productDelete }, { $set: { delete: false } });
            let productList = await productModel.find({}).sort({ _id: -1 });
            let categoryList = await categoryModel.find({});
            res.render("admin/showProducts", { productList, categoryList });
        } else {
            res.redirect("/admin/products");
        }
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const activateProduct = async (req, res, next) => {
    try {
        let productDelete = req.params.id;
        let done = await productModel.findById({ _id: productDelete });
        if (done) {
            let block = await productModel.updateOne({ _id: productDelete }, { $set: { delete: true } });
            let productList = await productModel.find({}).sort({ _id: -1 });
            let categoryList = await categoryModel.find({});
            res.render("admin/showProducts", { productList, categoryList });
        } else {
            res.redirect("/admin/products");
        }
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const actionFalse = async (req, res, next) => {
    try {
        let action = req.params.id;
        let block = await userModel.updateOne({ _id: action }, { $set: { block: false } });
        if (block) {
            res.redirect("/admin/customers");
        } else {
            res.redirect("/admin");
        }
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const actionTrue = async (req, res, next) => {
    try {
        let action = req.params.id;
        let block = await userModel.updateOne({ _id: action }, { $set: { block: true } });
        if (block) {
            res.redirect("/admin/customers");
        } else {
            res.redirect("/admin");
        }
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const editCategory = async (req, res, next) => {
    try {
        let findId = req.params.id;
        let categoryId = await categoryModel.findOne({ _id: findId });
        res.render("admin/editCategory", { categoryId, message: false });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        let categoryinfo = req.params.id;
        let detail = await categoryModel.findByIdAndDelete({ _id: categoryinfo });
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const detail_prdouct = async (req, res, next) => {
    try {
        let findId = req.params.id;
        let editProduct = await productModel.findOne({ _id: findId });
        let categoryList = await categoryModel.find({});
        console.log(editProduct);
        res.render("admin/productDetails", { editProduct, categoryList });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        let ID = req.params.id;
        let productID = await productModel.findOne({ _id: ID });
        let categoryList = await categoryModel.find({});
        res.render("admin/productEdit", { productID, categoryList });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const updatedProduct = async (req, res, next) => {
    let body = req.body;
    console.log(body);
    let productId = req.params.id;
    let image = req.files;
    console.log(image);
    try {
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
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const coupon = async (req, res, next) => {
    try {
        let cooopon = await couponModel.find({});
        res.render("admin/coupon", { cooopon });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const addCoupon = async (req, res, next) => {
    try {
        res.render("admin/addCoupon");
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const addCouponPost = async (req, res, next) => {
    console.log(req.body);
    let couponMsg;
    let couponcode = req.body.couponCode;
    try {
        let coupon = await couponModel.findOne({ couponCode: couponcode });
        if (coupon) {
            couponMsg = "coupon already exist";
            res.json({ status: true, couponMsg });
            console.log(1111);
        } else {
            await couponModel.create(req.body).then(() => {
                res.json({ success: true });
                // console.log(data, +"data");
                console.log("done");
            });
        }
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const activeCoupon = async (req, res, next) => {
    let id = req.params.id;
    let di = req.body.id;
    console.log(di);
    console.log(id);
    try {
        let check = await couponModel.findOneAndUpdate({ _id: id }, { $set: { status: false } }).then(() => res.json());
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const revokeCoupon = async (req, res, next) => {
    // let id = req.body.id;
    let id = req.params.id;
    let di = req.body.id;
    console.log(di);
    console.log(id);
    try {
        let check = await couponModel.findOneAndUpdate({ _id: id }, { $set: { status: true } }).then(() => res.json());
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const deleteCoupon = async (req, res, next) => {
    let admin = req.session.admin_login._id;
    let id = req.query.id;
    try {
        const deletecop = await couponModel.findOneAndDelete(
            { _id: id },
            {
                $pull: {
                    _id: id,
                },
            }
        );
        res.json({ status: true });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const order = async (req, res, next) => {
    try {
        let order = await orderModel.find({}).populate("user").populate("items.productId").sort({ _id: -1 });
        let orderId = Math.round(Math.random() * 4685);
        res.render("admin/order", { order, orderId });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const orderDetails = async (req, res, next) => {
    let id = req.params.id;
    let details = await orderModel.findOne({ _id: id }).populate("items.productId").populate("user");
    console.log(details, 333);
    try {
        let addre = details.address;
        let address = await addressModel.findOne({ "address._id": addre });
        let index = address.address.findIndex((obj) => obj._id == addre.toString());
        let finalAddress = address.address[index];
        if (details) {
            for (let i = 0; i < details.items.length; i++) {
                let items = details.items[i]._id;
                let ObjId = items.toString("").slice(2, 9);
                console.log(ObjId);
            }
        }
        let cart = await cartModel.findOne({ owner: details.user });
        console.log(cart);
        res.render("admin/order_details", { details, cart, finalAddress });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const inventory = (productId, qntity) => {
    return new Promise((resolve, reject) => {
        productModel.findOneAndUpdate({ _id: productId }, { $inc: { quantity: qntity } }).then(() => {
            resolve();
        });
    });
};

const paymentStatus = async (req, res, next) => {
    let bo = req.query.id;
    let bod = req.body.status;
    try {
        let change = await orderModel.findOneAndUpdate({ _id: bo }, { $set: { order_status: bod } }).then(async () => {
            if (bod == "Completed") {
                let change = await orderModel
                    .findOneAndUpdate({ _id: bo }, { $set: { order_status: bod, payment_status: "confirm" } })
                    .then(() => {
                        res.json({ complete: true });
                    });
            } else if (bod == "Cancelled") {
                let addQty = await orderModel.findOne({ _id: bo }).populate("items.productId");
                for (let i = 0; i < addQty.items.length; i++) {
                    const element = addQty.items[i];
                    console.log(element);
                    let id = element.productId;
                    let qty = element.quantity;
                    inventory(id, qty);
                }
                let change = await orderModel.findOneAndUpdate(
                    { _id: bo },
                    { $set: { order_status: bod, payment_status: "returned" } }
                );
                res.json({ cancel: true });
            } else if (bod == "Pending Order") {
                let change = await orderModel.findOneAndUpdate({ _id: bo }, { $set: { order_status: bod } });
                res.json({ status: true });
            }
        });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const addBanner = async (req, res, next) => {
    try {
        res.render("admin/add_banner");
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const banner = async (req, res, next) => {
    try {
        let banner = await bannerModel.find({});
        res.render("admin/banner", { banner });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const addbannerPost = async (req, res, next) => {
    console.log(req.body);
    console.log(typeof req.body.bannerImages);
    try {
        let details = req.body;
        let bannerImages = req.files;
        let img = bannerImages[0].path.substring(7);
        const create = await bannerModel
            .create({
                url: details.url,
                description: details.description,
                bannerImages: img,
                price: details.price,
                title: details.title,
            })
            .then(() => {
                res.redirect("/admin/add_banner");
            });
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const editBanner = async (req, res, next) => {
    console.log(req.body);
    try {
        let imag = req.files;
        if (imag == 0) {
            let details = req.body;

            const edit = await bannerModel
                .updateOne(
                    { _id: req.body.id },
                    {
                        $set: {
                            url: details.url,
                            description: details.description,
                            price: details.price,
                            title: details.title,
                        },
                    }
                )
                .then(() => {
                    res.redirect("/admin/banner");
                });
        } else {
            let bannerImages = req.files;
            let img = bannerImages[0].path.substring(7);
            let details = req.body;

            const edit = await bannerModel
                .updateOne(
                    { _id: req.body.id },
                    {
                        $set: {
                            url: details.url,
                            description: details.description,
                            bannerImages: img,
                            price: details.price,
                            title: details.title,
                        },
                    }
                )
                .then(() => {
                    res.redirect("/admin/banner");
                });
        }
    } catch (error) {
        console.log(error);
        error.admin = true;
        next(error);
    }
};

const logout = (req, res, next) => {
    req.session.adminLogin = null;
    res.redirect("/admin");
};
// addCouponPost;

module.exports = {
    adminLogin,
    adminLoginPost,
    adminHome,
    weekly,
    graph,
    dailly,
    category,
    addCategory,
    report,
    sales,
    addCategoryPost,
    showProducts,
    addProduct,
    addProductPost,
    cateFind,
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
    coupon,
    addCoupon,
    addCouponPost,
    activeCoupon,
    revokeCoupon,
    deleteCoupon,
    order,
    orderDetails,
    paymentStatus,
    banner,
    addBanner,
    addbannerPost,
    editBanner,
    logout,
};
