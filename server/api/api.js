var express = require('express');
var router = express.Router();

const mongoose = require("mongoose");
const mongoDB = process.env.MONGO_URL || "mongodb://localhost:27017/testdb";
mongoose.connect(mongoDB);

mongoose.Promise = Promise;
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error"));

const Books = require("../models/Book");

router.post('/book', function(req, res, next) {
    Books.findOne({name: req.body.name}, (err, book) => {
        if(err) return next(err);
    
        if(!book) {
          console.log(req.body);
          new Books({
            name: req.body.name,
            author: req.body.author,
            pages: req.body.pages
          }).save((err) => {
            if(err) return next(err);
            return res.send(req.body);
          });
        } else {
          let message = `Book: ${req.body.name} is already in database.`;
          return res.status(403).json({msg: message});
        }
    
      });
});

router.get("/book/:name", (req, res) => {
  let name = req.params.name;
  Books.findOne( {name: name}, (err, foundBook) => {
    if(err) return next(err);
    if(foundBook) {
        return res.send(foundBook);
    } else {
      let message = `There is no book named ${name} in database`;
        return res.status(404).json({msg: message});
    }

});
})

module.exports = router;