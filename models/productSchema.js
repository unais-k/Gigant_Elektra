const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    productImages: {
        type: Array,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "category",
    },
    vendor: {
        type: String,
        required: true,
    },
});

const productModel = mongoose.model("products", productSchema);

module.exports = productModel;
