user_login = (req, res, next) => {
    if (req.session.user_login || req.session.otpverifyed) {
        next();
    } else {
        res.redirect("/userLogin");
    }
};

module.exports = user_login;
