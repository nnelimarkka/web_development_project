const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let bookSchema = new Schema({
    author: String,
    name: String,
    pages: Number
});

module.exports = mongoose.model("Books", bookSchema);