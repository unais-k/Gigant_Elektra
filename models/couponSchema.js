const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: "Active",
    },
    couponName: {
        type: String,
        required: true,
    },
    couponCode: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    minimumSpend: {
        type: Number,
        required: true,
    },
    maxSpend: {
        type: Number,
        required: true,
    },
    limit: {
        type: Number,
        required: true,
    },
});

const couponModel = new mongoose.model("coupon", couponSchema);
module.exports = couponModel;
