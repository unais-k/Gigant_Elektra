const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        owner: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "user",
                },
                limit: {
                    type: Number,
                    default: 0,
                    max: 2,
                },
                status: {
                    type: String,
                    default: "0/2",
                },
            },
        ],

        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        couponName: {
            type: String,
            required: true,
        },
        couponCode: {
            type: String,
            required: true,
            trim: true,
        },
        discount: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
        },
        minimumSpend: {
            type: Number,
            required: true,
        },
        maxSpend: {
            type: Number,
            required: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const couponModel = mongoose.model("coupon", couponSchema);
module.exports = couponModel;
