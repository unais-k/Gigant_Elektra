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
                trim: true,
            },
            lastname: {
                type: String,
                required: true,
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
            country: {
                type: String,
                required: true,
            },
        },
    ],
});
const addressModel = mongoose.model("address", addressSchema);

module.exports = addressModel;
