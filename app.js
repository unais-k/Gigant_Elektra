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
const { err } = require("./middleware/error_handler");
const { wishlistCount, countCart } = require("./middleware/count");
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

app.use(wishlistCount);
app.use(countCart);

app.use("/admin", adminRouter);
app.use("/", userRouter);

app.use(function (req, res, next) {
    const error = new Error(`Not found ${req.originalUrl}`);
    if (req.originalUrl.startsWith("/admin")) {
        error.admin = true;
    }
    error.status = 404;
    next(error);
});

// error handler
app.use(err);

app.listen(process.env.PORT, () => {
    console.log("server started");
});
