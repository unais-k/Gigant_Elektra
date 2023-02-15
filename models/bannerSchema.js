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
    price: {
        type: Number,
    },
    url: {
        type: String,
    },
});

const bannerModel = mongoose.model("banner", bannerSchema);

module.exports = bannerModel;
