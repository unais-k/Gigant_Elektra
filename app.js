const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const nocache = require("nocache");
const db = require("./config/connection");
const flash = require("connect-flash");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
const errorrs = require("./middleware/error_handler");
const { wishlistCount, cartCount, countCart } = require("./middleware/count");
const wishlistModel = require("./models/wishlistSchema");
const cartModel = require("./models/cartSchema");
require("dotenv");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(flash());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.secretKey,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60000000 },
    })
);
app.use(nocache());
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use((req, res, next) => {
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
});

app.use(countCart);

app.use("/admin", adminRouter);

app.use("/", userRouter);

// app.use(cartCount());
// app.use(wishlistCount());
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    // console.log("errorz");
    res.render("404");
    next(createError(404));
});
// error handler
app.use(errorrs);

app.listen(process.env.PORT, () => {
    console.log("server started");
});
