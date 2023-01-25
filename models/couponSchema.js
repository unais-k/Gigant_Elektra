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
    couponName: {
        type: String,
        required: true,
    },
    couponCode: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    minumumSpend: {
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
