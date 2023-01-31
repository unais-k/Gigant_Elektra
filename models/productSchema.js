const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
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
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        delete: {
            type: Boolean,
            default: true,
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// productSchema.plugin(softdelete);

const productModel = mongoose.model("products", productSchema);

module.exports = productModel;
