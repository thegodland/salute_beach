var mongoose = require("mongoose");

//define beach schema
var beachSchema = new mongoose.Schema({
          name:String,
          price:String,
          img:String,
          description:String,
          location:String,
          lat:Number,
          lng:Number,
          createdAt: { type: Date, default: Date.now },
          author:{
                    id:{
                              type:mongoose.Schema.Types.ObjectId,
                              ref:"User"
                    },
                    username:String
          },
          comments:[
              {
                  type:mongoose.Schema.Types.ObjectId,
                  ref:"Comment"
              }
              ]
});

module.exports = mongoose.model("Beach",beachSchema); 
