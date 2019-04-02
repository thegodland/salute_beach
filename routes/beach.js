var express = require("express");
var router = express.Router();
var Beach = require("../models/beach");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
}
 
var geocoder = NodeGeocoder(options);

router.use(function(req,res,next){
          res.locals.currentUser = req.user;
          next();
})

//index - show all beaches
router.get("/",function (req,res) {

          // console.log(req.user); fuzzy search
          if(req.query.search){
                    const regex = new RegExp(fuzzyRegex(req.query.search),'gi');
                    Beach.find({ $or:[{name:regex},{description:regex},{location:regex}]},function(err,allBeaches){
                    if(err){
                              console.log(err);
                    }else{
                              if(allBeaches.length<1){
                                        req.flash("error","The words are not contained in our website so far, make one now!")
                                        res.redirect("/beach");      
                              }else{
                                   res.render("beaches/index",{beaches:allBeaches, currentUser:req.user});       
                              }
                    }
          });     
                    
          }else{
               Beach.find({},function(err,allBeaches){
                    if(err){
                              console.log(err);
                    }else{
                       res.render("beaches/index",{beaches:allBeaches, currentUser:req.user});      
                    }
          });     
          }
          
});

//create - add a new beach to DB
router.post("/",ensureAuthenticated,function(req,res){
          var name = req.body.name;
          var price = req.body.price;
          var image = req.body.image;
          var description = req.body.description;
          var author = {
                    id: req.user._id,
                    username:req.user.name
          };
            geocoder.geocode(req.body.location, function (err, data) {
              if (err || !data.length) {
                req.flash('error', 'Invalid location');
                return res.redirect('back');
              }
              var lat = data[0].latitude;
              var lng = data[0].longitude;
              var location = data[0].formattedAddress;
          var newBeach = {name:name,price:price,img:image,description:description,author:author,location: location, lat: lat, lng: lng};
          Beach.create(newBeach,function(err,newCreated){
                    if(err){
                              console.log(err);
                    }else{
                              req.flash("info","A new beach has been created...")
                             res.redirect("/beach");       
                    }
          });
});
});

//new - display a form to create a new beach
router.get("/new",ensureAuthenticated,function(req, res) {
    res.render("beaches/new");
});

//show - show more details about one beach
router.get("/:id",function(req, res) {
          Beach.findById(req.params.id).populate("comments").exec(function (err,foundBeach) {
                    if(err){
                              console.log(err);
                    }else{
                            res.render("beaches/show",{beach:foundBeach});     
                    }
          });
});

//edit beach route
router.get("/:id/edit",checkOwnership,function(req,res){
          Beach.findById(req.params.id,function(err,beach){
                    
                    res.render("beaches/edit",{beach:beach});      
          });
});

//update beach route
router.put("/:id",checkOwnership,function(req,res){
          console.log(req.body);
          geocoder.geocode(req.body.beach.location, function (err, data) {
              if (err || !data.length) {
                req.flash('error', 'Invalid location');
                return res.redirect('back');
              }
              req.body.beach.lat = data[0].latitude;
              req.body.beach.lng = data[0].longitude;
              req.body.beach.location = data[0].formattedAddress;
          Beach.findByIdAndUpdate(req.params.id,req.body.beach,function(err,beach){
                    if(err){
                              req.flash("error",err.message);
                              res.redirect("back");
                    }else{
                              req.flash("info","This beach has been updated...")
                              res.redirect("/beach/"+req.params.id);
                    }
          })
          })
});

//destory beach route
router.delete("/:id",checkOwnership,function(req,res){
          Beach.findByIdAndRemove(req.params.id,function(err){
                    req.flash("info","The beach has been deleted...")
            res.redirect("/beach");
          });
});

//middleware to check if the user who logedin is the poster as well
function checkOwnership(req,res,next){
          if(req.isAuthenticated()){
                 Beach.findById(req.params.id,function(err,beach){
                    if(err){
                              res.redirect("back")
                    }else{
                              if(beach.author.id.equals(req.user._id)){
                                     next();     
                              }else{
                                        req.flash("error","only creator can edit")
                                      res.redirect("back")  
                              }
                    }
          })    
          }else{ 
                    req.flash("error","Login with Instagram to start...");
                    res.redirect("back");   
          }
}
          
//to check if the user has logedin
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.flash("error","Login with Instagram to start...");
  res.redirect('/beach');
}

function fuzzyRegex(text){
          return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;