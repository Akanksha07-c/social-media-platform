const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: {
        type: String,
        unique: true
    },
    password: String,
    profilepic: {
        type: String,
        default: "https://res.cloudinary.com/oilcrwsw/image/upload/v1789485806/user.png"
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    following: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
          }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ]
}, { timestamps: true});

module.exports = mongoose.model('user', userSchema);
