const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
            },
            quantity: {
                type: Number,
                default: 1,
            },
            totalPrice: {
                type: Number,
                default: 1,
            },
            date: {
                type: Date,
                defualt: Date.now,
            },
        },
    ],
    cartPrice: {
        type: Number,
        defualt: 0,
    },
});

const cartModel = mongoose.model("shopingcart", cartSchema);
module.exports = cartModel;
