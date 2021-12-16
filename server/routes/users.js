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
const hljs = require("highlight.js")

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

// formatting post body as highlight.js html string
function highlight(code) {
  return hljs.highlightAuto(code).value;
}

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

//get posts filtered by search search help from week 4 exercises
router.get("/posts/search/:expression", (req, res) => {
  let expression = req.params.expression;
  Posts.find({title: new RegExp(expression, "i")}, (err, postArray) => {
    if (err) throw err;
    if(postArray) {
      return res.send(postArray);
    } else {
      return res.json({message: "No posts found"});
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
      let editDate = Date(); //making sure both dates are initially same
      Posts.create(
        {
          author: req.user.id,
          username: req.user.username,
          title: req.body.title,
          body: req.body.body,
          formattedBody: highlight(req.body.body),
          date: editDate,
          lastEdited: editDate
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
router.post("/posts/comment/:title", passport.authenticate('jwt', {session: false}), (req, res) => {
  let editDate = Date();
  Posts.updateOne(
    {title: req.params.title},
    {$push: {comments: {
      author: req.user.id,
      username: req.user.username,
      body: req.body.body,
      date: editDate,
      lastEdited: editDate
    }}},
    (err, ok) => {
      if (err) throw err;
      else {
        return res.json({message: "ok"})
      }
    }
  )
})

//login same as week 7
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
              username: user.username,
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
                bio: "Lorem ipsum",
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

//get user info for profile page
router.get("/user/:user", (req, res) => {
  User.findOne({ username: req.params.user }, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({message: "no user found"});
    if(user) {
      return res.json({
        username: user.username,
        bio: user.bio,
        registerDate: user.registerDate
        //not sending whole user, because there is no need to send password
      });
    }
  })
})

//update user bio
router.post("/update/:user", passport.authenticate('jwt', {session: false}), (req, res) => {
  User.updateOne(
    {username: req.params.user},
    {$set: {bio: req.body.bio}},
    (err, ok) => {
      if (err) throw err;
      else {
        return res.json({message: "ok"})
      }
    }
  )
})

// Updating the post. Changing lastEdited to display editing time
router.post("/update/post/:title", passport.authenticate('jwt', {session: false}), (req, res) => {
  Posts.updateOne(
    {title: req.params.title},
    {$set: {
      body: req.body.body,
      formattedBody: highlight(req.body.body),
      lastEdited: Date()
    }},
    (err, ok) => {
      if (err) throw err;
      else {
        return res.json({message: "ok"})
      }
    }
  )
})

//deleting post (only admin)
router.post("/delete/post/:title", passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!(req.user.username === "ADMIN")) {
    return res.json({message: "good try"});
  }
  Posts.findOneAndDelete({title: req.params.title}, (err) => {
    if(err) throw err;
    res.json({message: "ok"});
  })
})

/* 
  Updating a comment. Some help: https://stackoverflow.com/questions/23318035/update-embedded-document-mongoose 
  and https://coderedirect.com/questions/361992/mongoose-updating-embedded-document-in-array
*/
router.post("/update/comment/:title/:id", passport.authenticate('jwt', {session: false}), (req, res) => {
  Posts.findOne({title: req.params.title}, (err, post) => {
    if (err) throw err;
    if (!post) {
      return res.status(403).json({message: "No post found"});
    }
    if (post) {
      let comment = post.comments.id(req.params.id);
      comment.body = req.body.body;
      comment.lastEdited = Date();

      post.save((err) => {
        if(err) throw err;
        else {
          return res.json({message: "ok"});
        }
      })
    }
  })
})

//Delete a comment (ADMIN only)
router.post("/delete/comment/:title/:id", passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!(req.user.username === "ADMIN")) {
    return res.json({message: "good try"});
  }
  Posts.findOne({title: req.params.title}, (err, post) => {
    if (err) throw err;
    if (!post) {
      return res.status(403).json({message: "No post found"});
    }
    if (post) {
      post.comments.id(req.params.id).remove();
      post.save((err) => {
        if(err) throw err;
        else {
          return res.json({message: "ok"});
        }
      })
    }
  })
})

module.exports = router;