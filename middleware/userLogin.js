user_login = (req, res, next) => {
    if (req.session.user_login) {
        next();
    } else {
        res.redirect("/userLogin");
    }
};

module.exports = user_login;
