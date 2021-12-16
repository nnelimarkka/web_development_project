var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var mongoose = require("mongoose")
const bcrypt = require("bcryptjs");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//Setting up mongoDB
const mongoDB = "mongodb://localhost:27017/testdb";
mongoose.connect(mongoDB);
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
const User = require("./models/User");
initializeAdmin();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/users", usersRouter);

var corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// admin account creation
function initializeAdmin() {
    User.findOne({username: "ADMIN"}, (err, user) => {
        if(err) {
          console.log(err);
          throw err
        };
        if(user){
          return;
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(process.env.ADMINPS, salt, (err, hash) => {
              if(err) throw err;
              User.create(
                {
                  username: "ADMIN",
                  password: hash,
                  bio: "Codebook admin since day 0",
                  registerDate: "1970-01-01T00:00:00.000+00:00"
                },
                (err, ok) => {
                  if(err) throw err;
                  return;
                }
              );
            });
          });
        }
      });
}


module.exports = app;
