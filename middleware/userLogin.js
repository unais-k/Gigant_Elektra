let userId = require("../models/userSchema");

exports.sessionCheck = async (req, res, next) => {
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

exports.user_login = async (req, res, next) => {
    if (req.session.user_login || req.session.otpverifyed) {
        if (await userId.findOne({ _id: req.session.user_login._id, block: false })) next();
    } else {
        req.session.user_login = false;
        res.redirect("/userRegister");
    }
};

exports.adminSession = async (req, res, next) => {
    if (req.session.adminLogin) {
        next();
    } else {
        req.session.adminLoginError = false;
        res.redirect("/admin");
    }
};

// module.exports = { user_login, sessionCheck, sessionCheckAxios, adminSession };
