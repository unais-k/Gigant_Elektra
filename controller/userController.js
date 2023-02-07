var express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
const userModel = require("../models/userSchema");
const mongoose = require("mongoose");
const productModel = require("../models/productSchema");
const { sendotp, verifyotp } = require("../config/otp");
const { response } = require("express");
const cartModel = require("../models/cartSchema");
const wishlistModel = require("../models/wishlistSchema");
const { count, find } = require("../models/userSchema");
const addressModel = require("../models/addressSchema");
const orderModel = require("../models/orderSchema");
const categoryModel = require("../models/categorySchema");
const couponModel = require("../models/couponSchema");
const { ObjectId } = require("mongodb");
const paypal = require("@paypal/checkout-server-sdk");
let userData;

const envirolment = process.env.NODE_ENV === "production" ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment;

const paypalCliend = new paypal.core.PayPalHttpClient(new envirolment(process.env.ClientId, process.env.SecretId));

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
    try {
        const username = req.body.username;
        const password = req.body.password;
        let response = null;
        let userId = await userModel.findOne({ userId: username });
        console.log(userId);
        if (userId) {
            let pass = bcrypt.compare(password, userId.password);
            if (pass) {
                if (userId.block) {
                    response = "Your Account is temporarly blocked";
                } else {
                    response = false;
                    req.session.user_login = userId;
                }
            } else {
                response = "Invalid Password";
                req.session.user_loginError = true;
            }
        } else {
            response = "Invalid username";
            req.session.user_loginError = true;
        }
        res.json({ response });
    } catch (error) {
        console.log(error);
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
    userData = {
        userName: req.body.fullname,
        userId: req.body.username,
        phone: req.body.phone,
        userEmail: req.body.email,
        password: req.body.password,
    };
    console.log(req.body);
    try {
        let response = null;
        if (req.session.user_login) {
            res.redirect("/login");
        } else {
            userData = req.body;
            if (await userModel.findOne({ userEmail: userData.userEmail })) {
                response = "Email id already exists";
            } else if (await userModel.findOne({ phone: userData.phone })) {
                response = "Mobile number is already exists";
            } else {
                userData = req.body;
                sendotp(userData.phone);
                response = null;
            }
        }
        res.json({ response });
    } catch (error) {
        next(error);
    }
};

const otpPage = async (req, res) => {
    let phone = userData.phone;
    console.log(phone);
    await res.render("user/otp_verify", { phone, user_details: false });
};

const otpVerifyPost = async (req, res) => {
    const password = userData.password;
    const phone = userData.phone;
    const otp = req.body.otp;
    console.log(phone);
    console.log(otp);
    await verifyotp(phone, otp).then(async (varification_check) => {
        if (varification_check.status == "approved") {
            const hashedpassword = await bcrypt.hash(password, 10);
            await userModel
                .create({
                    userName: userData.fullname,
                    userId: userData.username,
                    userEmail: userData.email,
                    phone: userData.phone,
                    password: hashedpassword,
                })
                .then((e) => {
                    req.session.user_login = e;
                    console.log(req.session.user_login, "sessssssin");
                    res.json({ response: true });
                });
            req.session.otpverifyed = true;
        } else {
            res.json({ response: false });
        }
    });
};

const userProduct = async (req, res) => {
    let sub = req.query.sub;
    let cat = req.query.cat;
    console.log(cat);
    console.log(sub);
    if (sub == "ALL" && cat) {
        let category = await categoryModel.find({});
        user_details = req.session.user_login;
        let productList = await productModel.find({ category: cat });
        console.log(productList, 444);
        await res.render("user/userProducts", { productList, user_details, category });
    } else if (sub && cat) {
        let category = await categoryModel.find({});
        user_details = req.session.user_login;
        let productList = await productModel.find({ category: cat, brand: sub });
        console.log(productList, 444);
        await res.render("user/userProducts", { productList, user_details, category });
    } else {
        user_details = req.session.user_login;
        let productList = await productModel.find({ delete: true }).sort({ _id: -1 });
        let category = await categoryModel.find({});
        await res.render("user/userProducts", { productList, user_details, category });
    }
};

// const filterProduct = async (req, res) => {
//     let {}
// };
// const userProductDetails = async (req, res) => {
//     let productList = await productModel.find({});
//     res.render("user/productDetails", { productList });
// };

const showProductDetails = async (req, res) => {
    let productList;
    let user_details = req.session.user_login;
    try {
        productList = await productModel.findOne({ _id: req.query.id });

        if (productList) {
            req.session.temp = productList._id;
        } else {
            temp = req.session.temp;
            productList = await productModel.findOne({ _id: temp });
        }

        await res.render("user/productDetails", { productList });
        if (req.session.user_login) {
            let cart = await cartModel.findOne({ owner: user_details._id, "items.productId": productList._id });
            let wishlist = await wishlistModel.findOne({ user: user_details._id });
            await res.render("user/productDetails", { productList, cart, user_details, wishlist });
        }
    } catch (error) {
        productList = req.session.temp;
        res.redirect("/productDetails?id=req.query.id");
    }
};

const wishlist = async (req, res) => {
    let user_details = req.session.user_login;
    let userId = req.session.user_login._id;
    let wishlist = await wishlistModel.findOne({ user: mongoose.Types.ObjectId(userId) }).populate("items.product");
    res.render("user/wishlist", { wishlist, user_details });
};

const addToWishlist = async (req, res) => {
    let userId = req.session.user_login._id;
    let response = null;
    let productId = req.body.id;
    const findProduct = await productModel.findOne({ _id: productId });
    let findUser = await wishlistModel.findOne({ user: userId });
    if (!findUser) {
        let addCart = await wishlistModel
            .create({
                user: userId,
                items: [
                    {
                        product: findProduct._id,
                    },
                ],
            })
            .then((data) => {
                res.json({ response: true });
            });
        console.log(addCart);
    } else {
        if (findUser) {
            let productExist = await wishlistModel.findOne({ user: userId, "items.product": productId });
            if (productExist) {
                res.json({ response: "productExist" });
            } else {
                const newProduct = await wishlistModel
                    .findOneAndUpdate(
                        { user: userId },
                        {
                            $push: {
                                items: {
                                    product: findProduct._id,
                                },
                            },
                        }
                    )
                    .then((data) => {
                        res.json({ status: true });
                    });
            }
        } else {
            console.log("error");
        }
    }
};

const deleteWishlist = async (req, res) => {
    let userId = req.session.user_login._id;
    let prodctId = req.query.productId;
    const deleteWishList = await wishlistModel.findOneAndUpdate(
        { user: userId },
        {
            $pull: {
                items: {
                    product: prodctId,
                },
            },
        }
    );
    res.json({ status: true });
};

const userHome = async (req, res, next) => {
    let productList = await productModel.find({}).sort({ _id: -1 });
    console.log(req.session.user_login, "helo session");
    user_details = req.session.user_login;

    if (user_details) {
        console.log(user_details._id, "id und");
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

        console.log(user_details, "ivde unde");
        res.render("user/userHome", { user_details, productList, cart: false });
    } else {
        await res.render("user/userHome", { user_details, productList, cart: false });
        console.log("error");
    }
};

const profile = async (req, res) => {
    console.log(req.session.user_login);
    let user_details = await userModel.findOne({ _id: req.session.user_login._id });
    res.render("user/profile", { user_details });
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
        // console.log(contact.address);
        // console.log(1212121212);
        // console.log(shipping);
        // console.log(8787878);
        // console.log(contact);
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
        let pushAddress = await addressModel
            .findOneAndUpdate(
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
            )
            .then(() => {
                res.json({ status: true });
            });
    } else {
        let addAddress = await addressModel
            .create({
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
            })
            .then(() => {
                res.json({ status: true });
            });
        console.log(addAddress);
    }
};

const firstAddress = async (req, res) => {
    let userId = req.session.user_login._id;
    let find = await addressModel.find({ "address._id": req.body.id });

    let address = await addressModel
        .updateOne(
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
        )
        .then(() => {
            res.json({ status: true });
        });
};

const editAddress = async (req, res) => {
    let userId = req.session.user_login._id;
    console.log(req.body.id);
    console.log(4444);
    let address = await addressModel
        .updateMany(
            { user: mongoose.Types.ObjectId(userId), "address._id": mongoose.Types.ObjectId(req.body.id) },
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
        )
        .then(() => {
            res.json({ status: true });
        });
};

const editingAddress = async (req, res) => {
    console.log(11111111111111111);
    let userId = req.session.user_login._id;
    let addressId = req.params.id;
    let findAdd = await addressModel.findOne({ user: userId, "address._id": addressId });
    console.log(findAdd);
    redirect("/checkout" + findAdd);
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

const cart = async (req, res) => {
    user_details = req.session.user_login;
    userId = req.session.user_login._id;
    console.log(userId);
    const cartItems = await cartModel.findOne({ owner: mongoose.Types.ObjectId(userId) }).populate("items.productId");
    console.log("cartItems" + cartItems);
    res.render("user/cart", { cartItems, user_details });
};

const addToCartShop = async (req, res) => {
    let userId = req.session.user_login._id;
    let response = null;
    let productId = req.body.id;
    const findProduct = await productModel.findOne({ _id: productId });
    let findUser = await cartModel.findOne({ owner: userId });
    if (findProduct.quantity) {
        if (!findUser) {
            console.log(" creating cart");
            let addCart = await cartMode
                .create({
                    owner: userId,
                    items: [
                        {
                            productId: findProduct._id,
                            totalPrice: findProduct.price,
                        },
                    ],
                    cartPrice: findProduct.price,
                })
                .then((data) => {
                    res.json({ response: true });
                });
            console.log(addCart);
        } else {
            if (findUser) {
                let productExist = await cartModel.findOne({ owner: userId, "items.productId": productId });
                if (productExist) {
                    console.log("productexiatS");
                    res.json({ response: "productExist" });
                } else {
                    const newProduct = await cartModel
                        .findOneAndUpdate(
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
                        )
                        .then((data) => {
                            res.json({ status: true });
                        });
                }
            } else {
                console.log("error");
            }
        }
    } else {
        res.json({ response: "outofstock" });
    }

    // res.json({ response: true });
    // console.log(addCart);
    console.log("added to cart from Shop");
};

const quantityChange = async (req, res) => {
    try {
        let userId = req.session.user_login._id;
        let cart = await cartModel.findOne({ _id: req.body.cartId });
        const products = await productModel.findOne({ _id: req.body.productId });

        productPrice = products.price;
        const cartCount = req.body.count;

        if (cartCount == 1) {
            const index = cart.items.findIndex((obj) => obj.productId == req.body.productId);
            console.log(index);
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

    const product = await productModel.findOne({ _id: prodctId });

    const cart = await cartModel.findOne({ owner: userId, "items.productId": product });

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
    req.session.cartId = req.query.id;
    console.log(req.session.cartId);
    let user_details = req.session.user_login;
    let userId = req.session.user_login._id;
    let cartId = req.session.cartId;

    let Add = await addressModel.findOne({ user: userId });
    let bill = await cartModel.findOne({ owner: userId });
    let cartT = bill.cartPrice;
    req.session.cartTotal = cartT;
    console.log(bill, "12345678sdfghjkl");
    if (Add) {
        let Address = Add.address[0];
        console.log(Address);
        res.render("user/billingAddress", { user_details, Address, Add, bill, cartId });
    } else {
        res.render("user/billingAddress", {
            user_details,
            Address: false,
            Add: false,
            bill,
            cartId: false,
        });
    }
};

const shipping = async (req, res) => {
    req.session.address = req.query.id;
    let address = await addressModel.findOne({ "address._id": req.session.address });
    let innerAddress = address.address.findIndex((obj) => obj._id == req.session.address);
    let bill = await cartModel.findOne({ owner: req.session.user_login._id });
    let addressId = req.session.address;
    res.render("user/shipping", { bill, addressId });
};

const shippingCharge = async (req, res) => {
    let userID = req.session.user_login._id;
    let id = await cartModel.findOne({ owner: userID });
    let charge = req.body.id;
    let cartPrice = id.cartPrice;
    if (id) {
        let adding = charge + cartPrice;
        req.session.amount = { adding, charge };
        res.json({ charge, adding });
    } else {
        res.json((response = "charge"));
    }
};

const payment = async (req, res) => {
    let userId = req.session.user_login._id;
    let bill = await cartModel.findOne({ owner: userId });
    let charge = req.session.amount;
    res.render("user/payment", { charge, bill, paypalCliendid: process.env.ClientId });
};

const coponCheck = async (req, res) => {
    console.log(11111);
    let response;
    let Msg;
    let userId = req.session.user_login._id;
    let couponcode = req.body.code;
    console.log(couponcode, "cooopon");
    req.session.couponcode = couponcode;
    console.log(couponcode, "coopooooon");
    let coopon = await couponModel.findOne({ couponCode: couponcode }).then(async (data) => {
        console.log(data, "data");
        data._id = req.session.couponAdded;
        if (data) {
            let { startDate, endDate, discount, minimumSpend, maxSpend, limit } = data;
            let start = new Date(startDate);
            let end = new Date(endDate);
            const now = new Date(Date.now());
            console.log(start, end, now);
            if (now >= start) {
                if (now <= end) {
                    let cartTotal = await cartModel.findOne({ owner: userId }).then(async (total) => {
                        console.log(total.cartPrice);
                        let cartPrice = total.cartPrice;
                        let shipping = req.session.amount;
                        console.log(shipping);
                        if (minimumSpend <= cartPrice) {
                            if (cartPrice <= maxSpend) {
                                let limit = await couponModel
                                    .findOne({ couponCode: couponcode, "owner.user": userId })
                                    .then(async (lim) => {
                                        if (lim) {
                                            Msg = `You have already used this coupon`;
                                            res.json({ status: false, Msg });
                                        } else {
                                            let redeem = Math.round((cartPrice * discount) / 100);
                                            req.session.discount = redeem;
                                            let total = shipping.adding - redeem;
                                            Msg = "Coupon applied";
                                            response = {
                                                redeem,
                                                status: true,
                                                total,
                                                Msg,
                                            };
                                            req.session.coupon = response;
                                            res.json({ response });
                                        }
                                    });
                            } else {
                                Msg = `You have exceeded coupon limit, try another coupon`;
                                res.json({ status: false, Msg });
                                console.log(11);
                            }
                        } else {
                            Msg = `You have to spend minimum of ${minimumSpend} to apply this coupon`;
                            res.json({ status: false, Msg });
                            console.log(111);
                        }
                    });
                } else {
                    Msg = "Coupon has enxpired";
                    res.json({ status: false, Msg });
                    console.log(112);
                }
            } else {
                Msg = "Coupon offer not started yet";
                res.json({ status: false, Msg });
                console.log(113);
            }
        } else {
            Msg = "The Coupon is not valid";
            res.json({ status: false, Msg });
            console.log(114);
        }
    });
    console.log(coopon, "coooooopon");
    // res.json({ success: true });
};

const createorder = async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    const balance = req.body.items[0].amount;
    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: balance,

                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: balance,
                        },
                    },
                },
            },
        ],
    });
    try {
        const order = await paypalCliend.execute(request);
        res.json({ id: order.result.id });
    } catch (error) {
        res.redirect("/errorpage");
    }
};

// const inventory = async (id, qty) => {
//     await productModel.findOneAndUpdate({ _id: id }, { $inc: { quantity: -qty } }).then(() => {
//         return;
//     });
// };

const inventory = (productId, qntity) => {
    return new Promise((resolve, reject) => {
        productModel.findOneAndUpdate({ _id: productId }, { $inc: { quantity: -qntity } }).then(() => {
            resolve();
        });
    });
};

// const cancelInventory = (productId, qntity) => {
//     return new Promise((resolve, reject) => {
//         productModel.findOneAndUpdate({ _id: productId }, { $inc: { quantity: -qntity } }).then(() => {
//             resolve();
//         });
//     });
// };

const paymentPost = async (req, res) => {
    const payment = req.body.payment;
    console.log(payment);
    const address = await addressModel.findOne({ "address._id": req.session.address });
    let userId = req.session.user_login._id;
    let cartId = req.session.cartId;
    let cart = await cartModel.findOne({ _id: cartId }).populate("items.productId");
    let code = req.session.couponcode;
    let coupon = await couponModel.findOne({ couponCode: code, "owner.user": userId });

    // console.log(couponAdd, "couponAdd");
    // }
    const total = req.session.amount.adding;
    if (payment == "cod") {
        let couponAdd = await couponModel.updateOne(
            { couponCode: code },
            {
                $push: { owner: { user: userId, status: "1/2", limit: 1 } },
                $inc: {
                    quantity: -1,
                },
            }
        );
        let process = await orderModel
            .create({
                user: userId,
                address: req.session.address,
                items: cart.items,
                total: req.session.amount.adding,
                delivery: req.session.amount.charge,
                order_status: "pending",
                payment_status: "pending",
                payment_method: payment,
                cartTotal: req.session.cartTotal,
                coupon: req.session.couponAdded,
                order_date: new Date(),
            })
            .then(async (result) => {
                req.session.orderId = result._id;
                res.json({ cash: true });
            });

        let userAdd = await userModel
            .findOneAndUpdate(
                { _id: userId },
                { $push: { orders: { orderId: req.session.orderId, total: req.session.amount.adding } } }
            )
            .then(async () => {
                let cartIt = await cartModel.findOne({ owner: userId }, { _id: 0, items: 1 });
                for (let i = 0; i < cartIt.items.length; i++) {
                    const id = cartIt.items[i].productId;
                    const qty = cartIt.items[i].quantity;
                    await inventory(id, qty);
                    console.log("inventory       11");
                }
            })
            .then(async () => {
                await cartModel.findOneAndUpdate({ owner: userId }, { $set: { items: [], cartPrice: 0 } });
            });
    } else {
        res.json({ paypa: true, total });
    }
};

const verifyPaypal = async (req, res) => {
    const address = await addressModel.findOne({ "address._id": req.session.address });
    let userId = req.session.user_login._id;
    let cartId = req.session.cartId;
    let cart = await cartModel.findOne({ _id: cartId }).populate("items.productId");
    let code = req.session.couponcode;
    let couponAdd = await couponModel.updateOne(
        { couponCode: code },
        {
            $push: { owner: { user: userId, status: "1/2", limit: 1 } },
            $inc: {
                quantity: -1,
            },
        }
    );
    let process = await orderModel
        .create({
            user: userId,
            address: req.session.address,
            items: cart.items,
            total: req.session.amount.adding,
            delivery: req.session.amount.charge,
            order_status: "pending",
            payment_status: "confirm",
            payment_method: "paypal",
            cartTotal: req.session.cartTotal,
            coupon: req.session.couponAdded,
            order_date: new Date(),
        })
        .then(async (result) => {
            req.session.orderId = result._id;
        });
    let userAdd = await userModel
        .findOneAndUpdate(
            { _id: userId },
            { $push: { orders: { orderId: req.session.orderId, total: req.session.amount.adding } } }
        )
        .then(async () => {
            let cartIt = await cartModel.findOne({ owner: userId }, { _id: 0, items: 1 });
            for (let i = 0; i < cartIt.items.length; i++) {
                const id = cartIt.items[i].productId;
                const qty = cartIt.items[i].quantity;
                await inventory(id, qty);
            }
        })
        .then(async () => {
            await cartModel.findOneAndUpdate({ owner: userId }, { $set: { items: [], cartPrice: 0 } });
        });

    res.json({ succ: true });
};

const checkoutReview = async (req, res) => {
    let userId = req.session.user_login._id;
    let bill = await cartModel.findOne({ owner: userId });
    let charge = req.session.amount;
    let orderiddd = req.session.orderId;
    console.log(orderiddd, "sdfghjkkjhgfdsdfghjk");
    let order = await orderModel.findOne({ _id: req.session.orderId }).populate("items.productId");
    console.log(order, 111);
    const addressId = order.address._id;
    const address = await addressModel.findOne({ "address._id": req.session.address });
    const index = await address.address.findIndex((obj) => obj._id == req.session.address);
    const finalAddress = address.address[index];
    let discount = req.session.coupon;
    if (discount) {
        res.render("user/checkout_review", { charge, bill, finalAddress, order, discount });
    } else {
        res.render("user/checkout_review", { charge, bill, finalAddress, order, discount: false });
    }
};

const success = async (req, res) => {
    res.render("user/success");
};

const orderView = async (req, res) => {
    let user_details = req.session.user_login;
    let order = await orderModel.find({ user: req.session.user_login._id }).sort({ _id: -1 });
    let total = res.render("user/order_List", { user_details, order });
};

const orderViewCheck = async (req, res) => {
    let orderCheck = await orderModel.findOne({ user: req.session.user_login._id });
    if (orderCheck) {
        res.json({ scc: true });
    } else {
        res.json({ status: true });
    }
};

const orderDetails = async (req, res) => {
    let userId = req.session.user_login._id;
    let user_details = req.session.user_login;
    let orderId = req.params.id;
    let sum = 0;
    let order = await orderModel.findOne({ _id: orderId }).populate("items.productId");
    let orderAddress = order.address;
    let addressS = await addressModel.findOne({ "address._id": orderAddress });
    let Index = addressS.address.findIndex((obj) => obj._id == orderAddress.toString());
    let finalAddress = addressS.address[Index];
    res.render("user/order_details", { user_details, finalAddress, order });
};

const cancelInventory = async (id, qty) => {
    await productModel.findOneAndUpdate({ _id: id }, { $inc: { quantity: qty } }).then(() => {
        return;
    });
};

const cancelOrder = async (req, res) => {
    let id = req.query.id;
    let userId = req.session.user_login._id;
    const find = await orderModel.findOne({ _id: id });
    const findCart = await cartModel.findOne({ owner: userId }, { _id: 0, items: 1 });
    for (let i = 0; i < findCart.items.length; i++) {
        const id = findCart.items[i].productId;
        const qty = findCart.items[i].quantity;
        await cancelInventory(id, qty);
    }
    let cancel = await orderModel
        .findOneAndUpdate({ _id: id }, { $set: { order_status: "Cancelled", payment_status: "returned" } })
        .then(() => {
            res.json({ succ: true });
        });
};

const forgotPassword = async (req, res) => {
    res.render("user/forgot_password", { user_details: false });
};

const forgorpasswordPost = async (req, res) => {
    let response = null;
    console.log(req.body.email, 11);
    let userfind = await userModel.findOne({ userEmail: req.body.email }, { _id: 0, phone: 1 }).then((user) => {
        console.log(user, 1111);
        if (user) {
            sendotp(user.phone);
            res.json({ mobile: user.phone });
        } else {
            res.json({ response: "Email id not found" });
        }
    });
    // res.json({ response });
};

const otpforgotverify = async (req, res) => {
    try {
        let { otp, number } = req.body;
        console.log(req.body);
        console.log(2222);
        await verifyotp(number, otp).then((response) => {
            console.log("waiting for otp verify");
            if (response) {
                res.json({ response: true });
            } else {
                res.json({ response: false });
            }
        });
    } catch (error) {
        console.log(error);
        console.log(11111111111111);
    }
};

const changePassword = async (req, res) => {
    let { password, email } = req.body;
    password = await bcrypt.hash(password, 10);
    userModel.updateOne({ userEmail: email }, { $set: { password: password } }).then((e) => {
        res.json({ succ: true });
    });
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
    // filterProduct,
    profile,
    otpPage,
    wishlist,
    addToWishlist,
    deleteWishlist,
    logout,
    otpVerify,
    otpVerifyPost,
    personalAddress,
    firstAddress,
    personalAddressPost,
    editAddress,
    editingAddress,
    deleteAddress,
    cart,
    quantityChange,
    addToCartShop,
    deleteCart,
    coponCheck,
    checkout,
    shipping,
    shippingCharge,
    paymentPost,
    verifyPaypal,
    createorder,
    checkoutReview,
    success,
    orderView,
    orderViewCheck,
    orderDetails,
    cancelOrder,
    forgotPassword,
    forgorpasswordPost,
    otpforgotverify,
    changePassword,
    payment,
};
