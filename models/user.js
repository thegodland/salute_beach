var mongoose = require("mongoose");

// define user schema
var UserSchema = new mongoose.Schema({
    oauthID: Number,
    // id: mongoose.Types.ObjectId(),
    name:String,
    image:String,
    bio:String,
    media:Number,
    follows:Number,
    fans:Number
})

module.exports = mongoose.model("User",UserSchema); 