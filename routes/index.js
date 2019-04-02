var express = require("express");
var router = express.Router();
var passport = require("passport");

router.use(function(req,res,next){
          res.locals.currentUser = req.user;
          next();
})

router.get("/",function(req,res){
   res.render("landing");
});

// auth routes
router.get('/auth/instagram', passport.authenticate('instagram'));
router.get('/auth/instagram/callback', passport.authenticate('instagram', {

   successRedirect: '/beach',
   failure: '/beach'
 })) 

//to log out
router.get('/logout', function(req, res){
  req.logout();
  req.flash("info","See you next time!");
  res.redirect('/beach');
});

module.exports = router;