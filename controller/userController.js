var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");
const mongoose = require("mongoose");
const productModel = require("../models/productSchema");
const { sendotp, verifyotp } = require("../config/otp");
const { response } = require("express");
const cartModel = require("../models/cartSchema");
const { count } = require("../models/userSchema");
const addressModel = require("../models/addressSchema");
const { ObjectId } = require("mongodb");

const userLogin = (req, res) => {
    if (req.session.user_login) {
        res.render("user/profile", { message: false });
    } else {
        req.session.user_loginError = true;
        res.render("user/userLogin", { message: false, user_details: false });
    }
    // res.render("user/userLogin", { message: false });
};

const userLoginPost = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    let userId = await userModel.findOne({ userId: username });
    if (userId) {
        let pass = bcrypt.compare(password, userId.password);
        if (pass) {
            req.session.user_login = userId;
            res.redirect("/");
        } else {
            req.session.user_loginError = true;
            res.render("user/userLogin", { message: "Password error" });
        }
    } else {
        req.session.user_loginError = true;
        res.render("user/userLogin", { message: "username error" });
    }
    // res.render("user/userHome");
};

const userRegister = (req, res, next) => {
    if (req.session.user_login) res.redirect("/");
    else res.render("user/userRegister", { message: false, user_details: false });
};

const userRegisterPost = async (req, res, next) => {
    const userDetails = {
        userName: req.body.fullname,
        userId: req.body.username,
        phone: req.body.phone,
        userEmail: req.body.email,
        password: req.body.password,
    };

    try {
        if (req.session.user_login) res.redirect("/userLogin");
        else {
            if (await userModel.findOne({ userEmail: userDetails.userEmail })) {
                res.render("user/userRegister", { message: "Email id already exists" });
            } else {
                if (await userModel.findOne({ phone: userDetails.phone })) {
                    res.render("user/userRegister", { message: "Phone number already exists" });
                } else {
                    if (req.body.password == req.body.confirmpassword) {
                        userDetails.password = await bcrypt.hash(userDetails.password, 10);
                        console.log("password hashing");
                        console.log(userDetails.password);
                        await userModel.create({
                            userName: req.body.fullname,
                            userId: req.body.username,
                            userEmail: req.body.email,
                            phone: req.body.phone,
                            password: userDetails.password,
                            userImage: req.file.filename,
                        });
                        // req.session.user = true;
                        req.session.user_login = user;
                        res.redirect("/");
                    } else {
                        console.log("error in password hasing");
                        req.session.user_loginError = true;
                        res.render("user/userRegister", { message: "please check password again" });
                    }
                }
            }
        }
    } catch (error) {
        next(error);
    }
    // res.render("user/userLogin");
};

const otpVerify = async (req, res, next) => {
    const userDetails = {
        userName: req.body.fullname,
        userId: req.body.username,
        phone: req.body.phone,
        userEmail: req.body.email,
        password: req.body.password,
    };
    console.log(req.body);
    if (req.session.user_login) {
        res.redirect("/login");
    } else {
        req.session.user_login = req.body;
        if (await userModel.findOne({ userEmail: userDetails.userEmail })) {
            res.render("user/userRegister", { message: "Email id already exists" });
        } else {
            if (await userModel.findOne({ phone: userDetails.phone })) {
                res.render("user/userRegister", { message: "Phone number already exists" });
            } else {
                if (req.body.password == req.body.confirmpassword) {
                    // req.session.user_login = req.body;
                    // console.log("post register");
                    // console.log(req.session.user_login);
                    // sendotp(userDetails.phone);
                    // console.log("send otp");
                    // res.render("user/otpverify");
                    // this was code if otp ready
                    console.log(req.body);
                    const hashedpassword = await bcrypt.hash(userDetails.password, 10);
                    let userData = req.session.user_login;
                    await userModel.create({
                        userName: userData.fullname,
                        userId: userData.username,
                        userEmail: userData.email,
                        phone: userData.phone,
                        password: hashedpassword,
                    });
                    console.log("userData saved");
                    req.session.otpverifyed = true;
                    res.redirect("/");
                } else {
                    console.log("error in password hasing");
                    req.session.user_loginError = true;
                    res.render("user/userRegister", { message: "please check password again" });
                }
            }
        }
    }
};

const otpVerifyPost = async (req, res) => {
    let userData = req.session.user_login;
    console.log(userData);
    console.log(req.session.user_login + " req");
    const password = req.session.user_login.password;
    const phone = req.session.user_login.phone;
    const otp = req.body.otp;
    console.log(phone);
    console.log(otp);
    await verifyotp(phone, otp).then(async (varification_check) => {
        if (varification_check.status == "approved") {
            const hashedpassword = await bcrypt.hash(password, 10);
            let userData = req.session.user_login;
            await userModel.create({
                userName: userData.fullname,
                userId: userData.username,
                userEmail: userData.email,
                phone: userData.phone,
                password: hashedpassword,
            });
            console.log("userData saved");
            req.session.otpverifyed = true;
            res.redirect("/");
        } else {
            req.send("otp error", "otp not match");

            req.redirect("/otp_verify");
        }
    });
};

const userProduct = async (req, res) => {
    user_details = req.session.user_login;
    let productList = await productModel.find({});
    // const cartPro = await cartModel
    //     .findOne({ owner: mongoose.Types.ObjectId(user_details._id) })
    //     .populate("items.productId");
    // let cart = cartPro.items.slice(0, 3);

    await res.render("user/userProducts", { productList, user_details });
};

// const userProductDetails = async (req, res) => {
//     let productList = await productModel.find({});
//     res.render("user/productDetails", { productList });
// };

const showProductDetails = async (req, res) => {
    let productList;
    try {
        user_details = req.session.user_login;
        productList = await productModel.findOne({ _id: req.params.id });
        console.log(productList);
        if (productList) {
            req.session.temp = productList._id;
        } else {
            temp = req.session.temp;
            productList = await productModel.findOne({ _id: temp });
        }
        // const cartPro = await cartModel
        //     .findOne({ owner: mongoose.Types.ObjectId(user_details._id) })
        //     .populate("items.productId");
        // let cart = cartPro.items.slice(0, 3);

        await res.render("user/productDetails", { productList });
    } catch (error) {
        productList = req.session.temp;
        res.redirect("/productDetails/" + productList);
    }
};

const userHome = async (req, res, next) => {
    let productList = await productModel.find({});
    user_details = req.session.user_login;

    if (user_details) {
        const cartPro = await cartModel
            .findOne({ owner: mongoose.Types.ObjectId(user_details._id) })
            .populate("items.productId");
        if (cartPro) {
            let icon = cartPro.items.reduce((acc, curr) => (acc += curr.quantity), 0);
            let cart = icon;
            cart = cartPro.items.slice(0, 3);
            console.log(cart);
            await res.render("user/userHome", { user_details, productList, cart });
        }

        await res.render("user/userHome", { user_details, productList, cart: false });
    } else {
        await res.render("user/userHome", { user_details, productList, cart: false });
        console.log("error");
    }
};

const profile = async (req, res) => {
    let userId = req.params.id;
    let user_details = await userModel.findOne({ _id: userId });
    res.render("user/profile", { user_details });
};

const wishList = (req, res) => {
    if (req.session.user_login) {
        res.render("user/wishlist");
    } else {
        console.log("profile error");
        res.redirect("/userLogin");
    }
    // res.render("user/wishlist");
};

const personalAddress = async (req, res) => {
    console.log(55555555555555555555555555555555555555555);
    user_details = req.session.user_login;

    console.log(user_details);
    // let contact = await addressModel.aggregate([
    //     { $unwind: "$address" },
    //     { $match: { user: user_details._id, "address.contact": true } },
    // ]);
    // let shipping = await addressModel.aggregate([
    //     { $unwind: "$address" },
    //     { $match: { user: user_details._id, "address.contact": false } },
    // ]);

    let shipp = await addressModel.findOne({ user: user_details._id });
    if (shipp) {
        let contact = shipp.address[0];
        let shipping = shipp.address[1];
        console.log(contact.address);
        console.log(1212121212);
        console.log(shipping);
        console.log(8787878);
        console.log(contact);
        // console.log(shipping);
        // console.log(contact);
        res.render("user/userAddress", { user_details, contact, shipping });
    } else {
        res.render("user/userAddress", { user_details, shipping: false, contact: false });
    }
};

const personalAddressPost = async (req, res) => {
    let userDetails = req.body;
    // let contact = req.query.contact;
    console.log(userDetails);
    console.log(111111);
    // console.log(contact);
    let userId = req.session.user_login._id;
    let exist = await addressModel.findOne({ user: userId });
    if (exist) {
        let pushAddress = await addressModel.findOneAndUpdate(
            { user: userId },
            {
                $push: {
                    address: [
                        {
                            name: userDetails.name,
                            address: userDetails.address,
                            lastname: userDetails.lastname,
                            city: userDetails.city,
                            pincode: userDetails.pincode,
                            country: userDetails.country,
                            email: userDetails.email,
                            phone: userDetails.phone,
                        },
                    ],
                },
            }
        );
        res.json({ status: true });
    } else {
        let addAddress = await addressModel.create({
            user: userId,
            address: [
                {
                    name: userDetails.name,
                    lastname: userDetails.lastname,
                    address: userDetails.address,
                    city: userDetails.city,
                    pincode: userDetails.pincode,
                    country: userDetails.country,
                    email: userDetails.email,
                    phone: userDetails.phone,
                },
            ],
        });
        res.json({ status: true });
        console.log(addAddress);
    }
};

const firstAddress = async (req, res) => {
    let userId = req.session.user_login._id;
    let find = await addressModel.find({ "address._id": req.body.id });

    let address = await addressModel.updateOne(
        { "address._id": req.body.id },
        {
            $set: {
                "address.$.name": req.body.name,
                "address.$.lastname": req.body.lastname,
                "address.$.address": req.body.address,
                "address.$.pincode": req.body.pincode,
                "address.$.city": req.body.city,
                "address.$.phone": req.body.phone,
                "address.$.email": req.body.email,
                "address.$.country": req.body.country,
            },
        }
    );
    res.json({ status: true });
};

const editAddress = async (req, res) => {
    console.log(12345);

    console.log(req.body);

    let userId = req.session.user_login._id;

    let find = await addressModel.find({ "address._id": req.body.id });

    console.log(find, "kjijou");

    let address = await addressModel.updateOne(
        { "address._id": req.body.id },
        {
            $set: {
                "address.$.name": req.body.name,
                "address.$.lastname": req.body.lastname,
                "address.$.address": req.body.address,
                "address.$.pincode": req.body.pincode,
                "address.$.city": req.body.city,
                "address.$.phone": req.body.phone,
                "address.$.email": req.body.email,
                "address.$.country": req.body.country,
            },
        }
    );
    console.log(address);
    res.json({ status: true });
};

const deleteAddress = async (req, res) => {
    let userId = req.session.user_login._id;
    let delelteId = req.params.id;
    try {
        let dele = await addressModel.updateOne({ user: userId }, { $pull: { address: { _id: delelteId } } }).then(() => {
            res.json({});
        });
        console.log(dele);
    } catch (error) {
        console.log(error);
    }
};

// const updateAddress = async (req, res) => {
//     console.log(12345);
//     let userId = req.session.user_login._id;
//     // let address = await addressModel.findOne({ user: userId });
//     // let contact = address.address[0];
//     // let shipping = address.address[1];
//     let contactId = req.params.id;
//     let shippingId = req.params.id;
//     // let shippingAdd = await addressModel.aggregate([
//     //     { $unwind: "$address" },
//     //     { $match: { user: userId, "address.contact": true } },
//     // ]);
//     console.log(shippingId);
//     console.log(contactId);
//     let shippingAdd = await addressModel.findOne({ "address._id": shippingId });
//     let contactAdd = await addressModel.findOne({ "address._id": contactId });
//     console.log(shippingAdd.address[0].contact);
//     console.log(shippingAdd + "-shipping");
//     console.log(contactAdd + "contact");
//     if (shippingAdd.address[0].contact == true) {
//         console.log(12345678);
//         let updateCont = await addressModel.updateMany(
//             { user: userId, "address._id": contactId },
//             {
//                 $set: {
//                     "address.$.name": req.body.name,
//                     "address.$.address": req.body.address,
//                     "address.$.pincode": req.body.pincode,
//                     "address.$.city": req.body.city,
//                     "address.$.state": req.body.state,
//                     "address.$.country": req.body.country,
//                 },
//             }
//         );
//         console.log(updateCont);
//         res.redirect("/checkout");
//     } else {
//         console.log(987654);
//         let updateShip = await addressModel.updateMany(
//             { user: userId, "address._id": shippingId },
//             {
//                 $set: {
//                     "address.$.name": req.body.name,
//                     "address.$.address": req.body.address,
//                     "address.$.pincode": req.body.pincode,
//                     "address.$.city": req.body.city,
//                     "address.$.state": req.body.state,
//                     "address.$.phone": req.body.phone,
//                     "address.$.email": req.body.email,
//                     "address.$.country": req.body.country,
//                 },
//             }
//         );
//         console.log(updateShip);
//         res.redirect("/checkout");
//     }
// };

const cart = async (req, res) => {
    user_details = req.session.user_login;
    userId = req.session.user_login._id;
    console.log(userId);
    const cartItems = await cartModel.findOne({ owner: mongoose.Types.ObjectId(userId) }).populate("items.productId");
    console.log("cartItems" + cartItems);
    res.render("user/cart", { cartItems, user_details });
};

const addToCartHome = async (req, res, next) => {
    let userId = req.session.user_login._id;
    let response = null;
    let productId = req.body.id;
    const findProduct = await productModel.findOne({ _id: productId });
    console.log("findproduct" + findProduct);
    let findUser = await cartModel.findOne({ owner: userId });
    console.log("find user" + findUser);
    if (!findUser) {
        console.log(" creating cart");
        let addCart = await cartModel.create({
            owner: userId,
            items: [
                {
                    productId: findProduct._id,
                    totalPrice: findProduct.price,
                },
            ],
            cartPrice: findProduct.price,
        });
        res.json({ response: true });
        console.log(addCart);
    } else {
        if (findUser) {
            console.log("sdfghjkl");
            let productExist = await cartModel.findOne({ owner: userId, "items.productId": productId });
            if (productExist) {
                console.log("productexiatS");
                res.json({ response: "productExist" });
            } else {
                console.log(1234567);
                const newProduct = await cartModel.findOneAndUpdate(
                    { owner: userId },
                    {
                        $push: {
                            items: {
                                productId: findProduct._id,
                                totalPrice: findProduct.price,
                            },
                        },
                        $inc: {
                            cartPrice: findProduct.price,
                        },
                    }
                );
                console.log(newProduct);
                res.json({ response: "newAdded" });
            }
        } else {
            console.log("error");
        }
    }

    // res.json({ response: true });
    // console.log(addCart);
    console.log("added to cart from home");
};

const addToCartShop = async (req, res) => {
    let userId = req.session.user_login._id;
    let response = null;
    let productId = req.body.id;
    const findProduct = await productModel.findOne({ _id: productId });
    console.log("findproduct" + findProduct);
    let findUser = await cartModel.findOne({ owner: userId });
    console.log("find user" + findUser);
    if (!findUser) {
        console.log(" creating cart");
        let addCart = await cartModel.create({
            owner: userId,
            items: [
                {
                    productId: findProduct._id,
                    totalPrice: findProduct.price,
                },
            ],
            cartPrice: findProduct.price,
        });
        res.json({ response: true });
        console.log(addCart);
    } else {
        if (findUser) {
            let productExist = await cartModel.findOne({ owner: userId, "items.productId": productId });
            if (productExist) {
                console.log("productexiatS");
                res.json({ response: "productExist" });
            } else {
                const newProduct = await cartModel.findOneAndUpdate(
                    { owner: userId },
                    {
                        $push: {
                            items: {
                                productId: findProduct._id,
                                totalPrice: findProduct.price,
                            },
                            $inc: {
                                cartPrice: findProduct.price,
                            },
                        },
                    }
                );
                console.log(newProduct);
                res.json({ response: "newAdded" });
            }
        } else {
            console.log("error");
        }
    }

    // res.json({ response: true });
    // console.log(addCart);
    console.log("added to cart from Shop");
};

const quantityChange = async (req, res, next) => {
    try {
        let userId = req.session.user_login._id;
        let cart = await cartModel.findOne({ _id: req.body.cartId });
        const products = await productModel.findOne({ _id: req.body.productId });

        productPrice = products.price;
        const cartCount = req.body.count;

        if (cartCount == 1) {
            const index = cart.items.findIndex((obj) => obj.productId == req.body.productId);
            if (cart.items[index].quantity >= products.quantity) {
                res.json({ stock: true });
                return;
            } else {
                var productPrice = products.price;
            }
        } else {
            var productPrice = -products.price;
        }
        let updateCart = await cartModel.findOneAndUpdate(
            { _id: req.body.cartId, "items.productId": req.body.productId },
            {
                $inc: {
                    "items.$.quantity": cartCount,
                    "items.$.totalPrice": productPrice,
                    cartPrice: productPrice,
                },
            }
        );
        let index = updateCart.items.findIndex((objItems) => objItems.productId == req.body.productId);
        let newCart = await cartModel.findOne({ _id: req.body.cartId });
        let qty = newCart.items[index].quantity;
        let totalPrice = newCart.items[index].totalPrice;
        let cartPrice = newCart.cartPrice;

        res.json({ qty, totalPrice, cartPrice });
    } catch (error) {}
};

const deleteCart = async (req, res, next) => {
    let userId = req.session.user_login._id;
    let prodctId = req.query.productId;
    console.log(111111111111111111111111);
    const product = await productModel.findOne({ _id: prodctId });
    console.log(product);
    const cart = await cartModel.findOne({ owner: userId, "items.productId": product });
    console.log(cart);
    const index = await cart.items.findIndex((val) => {
        return val.productId == prodctId;
    });
    const price = cart.items[index].totalPrice;
    const cartTotal = product.price;
    const deletecart = await cartModel.updateOne(
        { owner: userId },
        {
            $pull: {
                items: {
                    productId: prodctId,
                },
            },
            $inc: { cartPrice: -price },
        }
    );
    console.log(deletecart, "deletecart");
    res.json({ status: true });
};

const checkout = async (req, res) => {
    let user_details = req.session.user_login;
    let userId = req.session.user_login._id;
    let Add = await addressModel.findOne({ user: userId });
    let bill = await cartModel.findOne({ owner: userId });
    if (Add) {
        let Address = Add.address[0];
        console.log(Address);
        res.render("user/billingAddress", { user_details, Address, Add, bill });
    } else {
        res.render("user/billingAddress", { user_details, Address: false, Add: false, bill: false });
    }
};

const shipping = async (req, res) => {
    res.render("user/shipping");
};

const payment = async (req, res) => {
    res.render("user/payment");
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect("/");
};

module.exports = {
    userHome,
    userLogin,
    userRegister,
    userRegisterPost,
    userLoginPost,
    userProduct,
    // userProductDetails,
    showProductDetails,
    profile,
    wishList,
    logout,
    otpVerify,
    otpVerifyPost,
    personalAddress,
    firstAddress,
    personalAddressPost,
    editAddress,
    deleteAddress,
    cart,
    addToCartHome,
    quantityChange,
    addToCartShop,
    deleteCart,
    checkout,
    shipping,
    payment,
};
