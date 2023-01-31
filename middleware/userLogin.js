let userId = require("../models/userSchema");

const sessionCheck = async (req, res, next) => {
    console.log(" session check");
    console.log(req.session.user_login);
    if (req.session.user_login || req.session.otpverifyed) {
        if (await userId.findOne({ _id: req.session.user_login._id, block: false })) console.log("session is ready");
        next();
    } else {
        req.session.user_login = false;
        res.redirect("/login");
    }
};

const sessionCheckAxios = async (req, res, next) => {
    if (req.session.user_login) {
        if (await userId.findOne({ _id: req.session.user_login._id, block: false })) {
            console.log("Axios session is ready");
            next();
        } else {
            req.session.user_login = false;
            res.json = { response: "login" };
        }
    } else {
        req.session.user_login = false;
        res.json = { response: "login" };
    }
};

const user_login = async (req, res, next) => {
    if (req.session.user_login || req.session.otpverifyed) {
        if (await userId.findOne({ _id: req.session.user_login._id, block: false })) next();
    } else {
        req.session.user_login = false;
        res.redirect("/userRegister");
    }
};

const admin_login = async (req, res, next) => {
    if (req.session.admin_login) {
        next();
    } else {
        req.session.admin_login = false;
        res.redirect("/admin");
    }
};

module.exports = { user_login, sessionCheck, sessionCheckAxios, admin_login };
