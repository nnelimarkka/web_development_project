//User model

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema ({
    username: {type: String},
    password: {type: String},
    registerDate: Date

});

module.exports = mongoose.model("users", userSchema);