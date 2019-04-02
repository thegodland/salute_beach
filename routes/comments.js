var express = require("express");
var router = express.Router({ mergeParams: true}); //to find the id
var Beach = require("../models/beach")
var Comment = require("../models/comment")

router.use(function(req,res,next){
          res.locals.currentUser = req.user;
          next();
})


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.flash("error","Login with Instagram to start...");
  res.redirect('/beach');
}

//comment routes to get the form of make a new comment
router.get("/new",ensureAuthenticated,function(req,res){
          Beach.findById(req.params.id,function(err,beach){
                    if(err){
                              console.log(err);
                              res.redirect("/beach");
                    }else{
                              res.render("comments/new",{beach:beach});
                    }
          });
});

//to post the comment on db
router.post("/",ensureAuthenticated,function(req,res){
          Beach.findById(req.params.id,function(err,beach){
                    if(err){
                              console.log(err);
                    }else{
                             Comment.create(req.body.comment,function(err,comment){
                                       if(err){
                                                 console.log(err);
                                                
                                       }else{
                                                 comment.author.id = req.user._id;
                                                 comment.author.username = req.user.name;
                                                 comment.save();
                                                 beach.comments.push(comment);
                                                 beach.save();
                                                 req.flash("info","A new comment has been created...")
                                                 res.redirect("/beach/"+beach._id);
                                       }
                             }); 
                    }
          });
});

//edit comment route
router.get("/:comment_id/edit",checkOwnership,function(req,res){
          Comment.findById(req.params.comment_id,function(err, comment) {
                     res.render("comments/edit",{beachId:req.params.id,comment:comment});       
          })
});

//update comment route
router.put("/:comment_id",checkOwnership,function(req,res){
          Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,comment){
                    req.flash("info","The comment has been updated...")
                        res.redirect("/beach/"+req.params.id);      
          })
});

//destory comment route
router.delete("/:comment_id",checkOwnership,function(req,res){
          Comment.findByIdAndRemove(req.params.comment_id,function(err){
                    req.flash("info","the comment has been deleted...")
            res.redirect("/beach/"+req.params.id);
          });
});

//middleware
function checkOwnership(req,res,next){
          if(req.isAuthenticated()){
                 Comment.findById(req.params.comment_id,function(err,comment){
                    if(err){
                              res.redirect("back")
                    }else{
                              if(comment.author.id.equals(req.user._id)){
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



module.exports = router;
