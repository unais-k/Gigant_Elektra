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

app.use("/admin", adminRouter);
app.use("/", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    // console.log("errorz");
    res.render("404");
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // console.log(err, "error");
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render("error");
});

app.listen(process.env.PORT, () => {
    console.log("server started");
});
