const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        required: true,
        type: String,
        trim: true,
    },
    vendor: {
        type: Array,
        ref: "vendor",
    },
});
const categoryModel = mongoose.model("Category", categorySchema);
module.exports = categoryModel;
