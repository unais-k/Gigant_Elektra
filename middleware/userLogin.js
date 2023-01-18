let userId = require("../models/userSchema");

const sessionCheck = async (req, res, next) => {
    console.log(" session check");
    console.log(req.session.user_login);
    if (req.session.user_login || req.session.otpverifyed) {
        if (await userId.findOne({ _id: req.session.user_login._id, block: false })) next();
    } else {
        req.session.user_login = false;
        res.redirect("/login");
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

module.exports = { user_login, sessionCheck };
