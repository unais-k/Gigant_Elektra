const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    address: [
        {
            name: {
                type: String,
                defarequiredult: true,
                trim: true,
            },
            address: {
                type: String,
                required: true,
            },
            pincode: {
                type: Number,
                required: true,
            },
            phone: {
                type: Number,
            },
            email: {
                type: String,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
            contact: {
                type: Boolean,
            },
        },
    ],
});
const addressModel = mongoose.model("address", addressSchema);

module.exports = addressModel;
