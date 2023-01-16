const mongoose = require("mongoose");
const softdelete = require("soft-delete-plugin-mongoose");

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
    thumbnail: {
        type: String,
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
        type: String,
        required: true,
    },
    vendor: {
        type: String,
        required: true,
    },
    delete: {
        type: Boolean,
        default: true,
    },
});

// productSchema.plugin(softdelete);

const productModel = mongoose.model("products", productSchema);

module.exports = productModel;
