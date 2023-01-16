const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    vendorname: {
        type: Array,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        ref: "category",
    },
});
const vendorModel = mongoose.model("vendor", vendorSchema);
module.exports = vendorModel;
