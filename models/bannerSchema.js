const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    bannerImages: {
        type: Array,
    },
    description: {
        type: String,
    },
});
