const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
        },
        image: {
            type: String,
            required: false,
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
    },
    {
        timestamps: true,
    }
);
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
