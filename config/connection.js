const mongoose = require("mongoose");
const express = require("express");
const app = express();
require("dotenv").config();

mongoose.set("strictQuery", false);
mongoose
    .connect(process.env.DatabaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        // If connection is successful, start the server.
        console.log("Port connected & Server at 3000");
        // app.listen(3000, () => {
        // });
    })
    .catch((error) => {
        console.log(error);
    });
