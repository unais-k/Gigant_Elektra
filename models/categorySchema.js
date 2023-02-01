const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        required: true,
        uppercase: true,
    },
    description: {
        required: true,
        type: String,
        trim: true,
    },
    Brand: {
        type: Array,
    },
});
const categoryModel = mongoose.model("Category", categorySchema);
module.exports = categoryModel;
