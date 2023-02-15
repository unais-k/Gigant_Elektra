const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "./public/images/uploads";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        date = Date.now();
        const { name } = req.body;
        cb(null, name + date + file.originalname);
    },
});

const editProductStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "./public";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        date = Date.now();
        const { name } = req.body;
        cb(null, name + date + " " + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const maxSize = 52428800;

const productPhoto = multer({
    storage: storage,
    // limits: {
    //     fileSize: maxSize,
    // },
    // fileFilter: fileFilter,
}).array("imageName", 3);

const editPhoto = multer({
    storage: editProductStorage,
    limits: {
        fileSize: maxSize,
    },
}).array("bannerImages", 4);

module.exports = { productPhoto, editPhoto };
