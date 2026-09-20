const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
   user : { type : mongoose.Schema.Types.ObjectId, ref : "user" },
   image: {type: String, default: null},
   content : String,
   likes : [
    {type : mongoose.Schema.Types.ObjectId, ref : "user"},
   ]

    
}, { timestamps: true});

module.exports =  mongoose.model('post', postSchema);

