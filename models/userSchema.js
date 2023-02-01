const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        userEmail: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: Number,
            default: true,
            unique: true,
        },
        block: {
            type: Boolean,
            default: false,
        },
        orders: [
            {
                orderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "order",
                },
                total: {
                    type: Number,
                },
            },
        ],
        product: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                },
                productStatus: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
