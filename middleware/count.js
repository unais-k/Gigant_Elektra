const mongoose = require("mongoose");
const cartModel = require("../models/cartSchema");
const wishlistModel = require("../models/wishlistSchema");

const cartCount2 = (req, res, next) => {
    if (req.session) {
        cartModel.find({ owner: req.session.user_login._id }).then((data) => {
            if (data) {
                let lengths = data.items.length;
                res.locals.count = lengths;
                next();
            } else {
                res.locals.count = 0;
                next();
            }
        });
    } else {
        next();
    }
};

const wishlistCount2 = (req, res, next) => {
    if (req.sessionx) {
        wishlistModel.find({ user: req.session.user_login._id }).then((data) => {
            if (data) {
                let lengths = data.items.length;
                res.locals.wishlist = lengths;
                next();
            } else {
                res.locals.wishlist = 0;
                next();
            }
        });
    } else {
        next();
    }
};

const countCart = (req, res, next) => {
    if (req.session.user_login) {
        cartModel.findOne({ owner: req.session.user_login._id }).then((data) => {
            if (data) {
                if (data.items.length > 0) {
                    let lengths = data.items.length;
                    res.locals.count = lengths;
                    next();
                } else {
                    res.locals.count = 0;
                    next();
                }
            } else {
                res.locals.count = 0;
                next();
            }
        });
    } else {
        next();
    }
};

const wishlistCount = (req, res, next) => {
    if (req.session.user_login) {
        wishlistModel.findOne({ user: req.session.user_login._id }).then((data) => {
            if (data) {
                if (data.items.length > 0) {
                    let lengths = data.items.length;
                    res.locals.wishlist = lengths;
                    next();
                } else {
                    res.locals.wishlist = 0;
                    next();
                }
            } else {
                res.locals.wishlist = 0;
                next();
            }
        });
    } else {
        next();
    }
};

module.exports = { countCart, wishlistCount };
