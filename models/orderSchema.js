const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "address",
            required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
                totalPrice: {
                    type: Number,
                },
            },
        ],
        total: {
            type: Number,
        },
        delivery: {
            type: Number,
            default: 0,
        },
        cartTotal: {
            type: Number,
            default: 0,
        },
        order_status: {
            type: String,
        },
        payment_status: {
            type: String,
        },
        payment_method: {
            type: String,
        },
        order_date: {
            type: Date,
            default: Date.now,
        },
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "coupon",
        },
    },
    {
        timestamps: true,
    }
);
const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;
