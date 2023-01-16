const mongoose = require("mongoose");
const { softDeletePlugin } = require("soft-delete-plugin-mongoose");
const Schema = mongoose.Schema;

const ChickenSchema = new Schema({
    name: String,
    lastName: String,
});

ChickenSchema.plugin(softDeletePlugin);
const Chicken = mongoose.model("Chicken", ChickenSchema);

module.exports = { Chicken };
