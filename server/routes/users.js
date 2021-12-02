var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const {body, validationResult } = require("express-validator");
const User = require("../models/User");
const Posts = require("../models/Posts");
const jwt = require("jsonwebtoken");
const passport = require("passport");
let jwtStrategy = require("passport-jwt").Strategy,
extractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config(); //new JwtStrategy was throwing errors help: https://stackoverflow.com/questions/45525077/nodejs-typeerrorjwtstrategy-requires-a-secret-or-key
const { application, request } = require('express');
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({storage})

/*
  Here I am using week 7 exercises as a basis for my userRouter.
  Only difference is that now there is no get calls for login or register pages,
  since that is handled entirely in the frontend side.

  Login and register are handled exactly as in week 7.
*/ 


let opts = {};
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

passport.use(new jwtStrategy(opts, (jwt_payload, done) => {
  User.findOne({username: jwt_payload.username}, function(err, user) {
      if (err) {
          return done(err, false);
      }
      if (user) {
          return done(null, user);
      } else {
          return done(null, false);
      }
  });
}));

router.use(passport.initialize());

/*router.post("/todos", passport.authenticate('jwt', {session: false}), (req, res) => {
  Todo.findOne({ user: req.user.id }, (err, todo) => {
    console.log(req.body.items);
    if (err)
      throw err;
    if (!todo) {
      Todo.create(
        {
          user: req.user.id,
          items: req.body.items
        },
        (err, ok) => {
          if(err) throw err;
          return res.send("ok");
        });
    } else {
      Todo.updateOne(
        {user: req.user.id},
        {$push: {items: {$each: req.body.items}}},
        (err, ok) => {
          if (err) throw err;
          return res.send("ok");
        });
        
      }
  });
});
*/

/*router.post("/todos/todo", passport.authenticate('jwt', {session: false}), (req, res) => {
  Todo.findOne({user: req.user.id}, (err, todo) => {
    if (err) throw err;
    if (!todo) return res.status(404).json({message: "no todo"});
    return res.send(todo);
  });
});
*/

//get all posts
router.get("/posts", (req, res) => {
  Posts.find({}, (err, postArray) => {
    if (err) throw err;
    if(!postArray) {
      return res.json({message: "No posts found"});
    } else {
      return res.send(postArray);
    }
  });
})

//get single post for commenting/viewing comments
router.get("/post/:title", (req, res) => {
  Posts.findOne({title: req.params.title}, (err, post) => {
    if (err) throw err;
    if (post) {
      res.send(post);
    } else {
      return res.status(403).json({message: `Post: ${req.params.title} not found`});
    }
  })
})

//posting a new post
router.post("/posts/post", passport.authenticate('jwt', {session: false}), (req, res) => {
  Posts.findOne({title: req.body.title}, (err, post) => {
    if (err) throw err;
    if (post) {
      return res.status(403).json({message: "Dublicate post"});
    } else {
    Posts.create(
      {
        author: req.user.id,
        username: req.user.username,
        title: req.body.title,
        body: req.body.body,
        date: Date()
      },
      (err, ok) => {
        if(err) throw err;
        return res.json({message: "ok"});
      }
    );
    }
  })
})

//Updating post with new comment, here it is safe to assume that post with title :title exists
router.post("/posts/update/:title", passport.authenticate('jwt', {session: false}), (req, res) => {
  Posts.updateOne(
    {title: req.params.title},
    {$push: {comments: {
      author: req.user.id,
      username: req.user.username,
      body: req.body.body,
      date: Date()
    }}},
    (err, ok) => {
      if (err) throw err;
      else {
        return res.json({message: "ok"})
      }
    }
  )
})

router.post('/login', 
  upload.none(),
  (req, res, next) => {
    User.findOne({ username: req.body.username }, (err, user) => {
      if (err)
        throw err;
      if (!user) {
        return res.status(403).json({ message: "Invalid credentials" });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
          if (err)
            throw err;
          if (isMatch) {
            const jwtPayload = {
              id: user._id,
              username: user.username
            };
            jwt.sign(
              jwtPayload,
              process.env.SECRET,
              {
                expiresIn: 120
              },
              (err, token) => {
                res.json({ success: true, token });
              }
            );
          } else {
              return res.status(403).json({ message: "Invalid credentials" }); 
          }
        });
      }

    });

  });

/*router.get("/user/users/:email", (req, res) => {
  User.findOne({email: req.params.email}, (err, user) => {
    if(err) throw err;
    if(!user) return res.status(404).json({user: "Not found"});
    if(user) return res.send(user);
  })
}); */

// Registering is same as exercise week 7, I decided to have username instead of email
router.post('/register', 
  upload.none(),
  body("username").isLength({min: 5}),
  body("password").isLength({min: 8}), //.isStrongPassword() would work
  (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);

    //Here I catch errors in validation and check that the password is strong enough with some "basic" reqex
    if(!errors.isEmpty() || !(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*[~`!@#\$%\^&\*\(\)\-_\+=\{\}\[\]\|\\;:"<>,\.\/\?]/.test(req.body.password))) {
      if (errors.isEmpty()) {
        return res.status(400).json({message: "Password is not strong enough"});
      }
      return res.status(400).json({message: "Password is not strong enough"});
    }
    User.findOne({username: req.body.username}, (err, user) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(user){
        return res.status(403).json({message: "Username already in use"});
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
            User.create(
              {
                username: req.body.username,
                password: hash,
                registerDate: Date()
              },
              (err, ok) => {
                if(err) throw err;
                return res.json({message: "ok"});
              }
            );
          });
        });
      }
    });
});



module.exports = router;