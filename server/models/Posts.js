/*
    I decided to include comments to the same document as posts
    as described here: https://mongoosejs.com/docs/2.7.x/docs/embedded-documents.html
    This makes it easier to handle comments, since now comments is basically an array within posts.
*/

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let Comments = new Schema({
    author: String,
    username: String,
    body: String,
    date: Date,
    lastEdited: Date
});

let Post = new Schema ({
    author: String, //author as objectId
    username: String,
    title: String,
    body: String,
    formattedBody: String, //formattedBody is for storing body in formatted form (highlight.js)
    date: Date,
    lastEdited: Date,
    comments: [Comments]

});

module.exports = mongoose.model("posts", Post);