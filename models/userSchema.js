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
        userImage: {
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
