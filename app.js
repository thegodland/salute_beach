//require all needed libraries
require("dotenv").config();
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    io = require("socket.io")(),
    session = require('express-session'),
    passport = require('passport'),
    Instagram = require('passport-instagram'),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    Beach = require("./models/beach"),
    User  = require("./models/user"),
    Comment = require("./models/comment");
const InstagramStrategy = Instagram.Strategy;
const dbconnect = require("./db").dblink;

//require all the routes file
var commentRoutes = require("./routes/comments"),
beachRoutes = require("./routes/beach"),
indexRoutes = require("./routes/index");

// express-session setup 
app.use(session({
  secret: 'web is so difficult to learn',
  resave: false, 
  saveUninitialized: false
}));

// mongoose.connect("mongodb://localhost/salute_beach");
//the database has already been hosted on mLab
mongoose.connect(dbconnect);

//configuration and claim global variables.
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
app.use(function(req,res,next){
          res.locals.currentUser = req.user;
          res.locals.error = req.flash("error");
          res.locals.info = req.flash("info");
          next();
});


app.use(passport.initialize());
app.use(passport.session());
 
//configure instagram auth
passport.use(new InstagramStrategy({
  clientID: "9303b3fcb075486d94a174f9a3f747fd",
  clientSecret: "c00cb75548be4bf2a6e1d632f562e8f9",
  callbackURL: "http://salute-beach-thegodland.c9users.io/auth/instagram/callback"
}, (accessToken, refreshToken, profile, done) => {
          User.findOne({ oauthID: profile.id }, function(err, user) {
                if(err) {
                  console.log(err);  // handle errors!
                }
                if (!err && user !== null) {
                  done(null, user);
                } else {
                  user = new User({
                        oauthID: profile.id,
                        name : profile.displayName,
                        image : profile._json.data.profile_picture,
                        bio : profile._json.data.bio,
                        media : profile._json.data.counts.media,
                        follows : profile._json.data.counts.follows,
                        fans : profile._json.data.counts.followed_by
                  });
                  user.save(function(err) {
                    if(err) {
                      console.log(err);  // handle errors!
                    } else {
                    //   console.log("saving user ...");
                      done(null, user);
                    }
                  });
          }
    });
  }
));

passport.serializeUser(function(user, done) {
//   console.log('serializeUser: ' + user._id);
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
//     console.log(user);
      if(!err) done(null, user);
      else done(err, null);
    });
});

app.use("/",indexRoutes);
app.use("/beach",beachRoutes);
app.use("/beach/:id/comments",commentRoutes);

//listen to port
var server = app.listen(process.env.PORT, process.env.IP,function(){
          console.log("Saulte Beach Server Has Started...");
});

io.attach(server);
io.on('connection', function(socket) {
  socket.on('postMessage', function(data) {
    io.emit('updateMessages', data);
  });
});