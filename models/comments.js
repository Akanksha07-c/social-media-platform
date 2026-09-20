const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
     },
     post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required: true
     },
     content: {
        type: String,
        required: true
     }
}, { timestamps: true });

module.exports = mongoose.model("comment" , commentSchema);