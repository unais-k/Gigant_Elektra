// error handler

const err = function (err, req, res, next) {
    // render the error page
    // res.status(err.status || 500);
    if (err.status == 404) {
        if (err.admin) {
            res.render("admin/404", { error: err.message });
        } else {
            res.render("user/404", { error: err.message });
        }
    } else {
        if (err.status == 500) {
            res.render("500", { error: "unfinded error" });
        } else {
            if (err.admin) {
                res.render("admin/404", { error: "server down" });
            } else {
                res.render("user/404", { error: "server down" });
            }
        }
    }
};

module.exports = { err };
