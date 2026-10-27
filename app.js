require('dotenv').config();
const express = require('express');
const app = express();
const userModel = require('./models/user.js');
const postModel = require('./models/post.js');
const commentModel = require('./models/comments.js');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const path = require('path');
const upload = require("./config/multerConfig");
const uploadToCloudinary = require("./utils/cloudinaryUpload.js");
const cloudinary = require("./config/cloudinaryConfig");
const asyncHandler = require("./utils/asyncHandler");


mongoose.connect(process.env.MONGO_URI, { family: 4 })
    .then(() => {
        console.log("MongoDB connected");
        console.log("Host:", mongoose.connection.host);
        console.log("Database:", mongoose.connection.name);
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.get('/', (req, res) => {
    res.render("index");
})

app.post('/register', asyncHandler(async (req, res) => {
    let { email, username, name, age, password } = req.body;

      // Normalize input
    username = username?.trim();
    email = email?.trim().toLowerCase();
    name = name?.trim();

    // Username validation
    if (!username) {
        return res.status(400).send("Username is required");
    }

    if (username.length < 3 || username.length > 30) {
        return res.status(400).send("Username must be between 3 and 30 characters");
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).send("Please enter a valid email");
    }

    if (!password || password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters");
    }

    const ageNumber = Number(age);

    if (!Number.isInteger(ageNumber) || ageNumber < 13 || ageNumber > 120) {
        return res.status(400).send("Please enter a valid age");
    }

    let existinguser = await userModel.findOne({ email });
    if (existinguser) return res.status(409).send("user already registered");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let user = await userModel.create({
        username,
        email,
        age : ageNumber,
        name,
        password: hashedPassword
    })
    let token = jwt.sign({ email: email, userid: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
    res.redirect('/profile');
}));

app.get('/login', (req, res) => {
    res.render("login");
})

app.post('/login', asyncHandler(async (req, res) => {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) return res.status(401).send("Invalid email or password");
    const result = await bcrypt.compare(password, user.password)
    if (!result) {
        return res.status(401).send("Invalid email or password");
    }
    let token = jwt.sign({ email: email, userid: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
    res.redirect('/profile');
}));


app.get('/profile', isLoggedIn, asyncHandler(async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("posts");

    res.render('profile', { user });
}));


app.get('/profile/upload', isLoggedIn, asyncHandler(async (req, res) => {
    res.render('image');
}));

app.post('/profile/remove-picture', isLoggedIn, asyncHandler(async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });

       if (user.profilepicPublicId) {
        await cloudinary.uploader.destroy(user.profilepicPublicId);
    }

    user.profilepic = undefined;
    user.profilepicPublicId = undefined;

    await user.save();

    res.redirect('/profile');
}));

app.post('/upload', isLoggedIn, upload.single("image"), asyncHandler(async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });

    if (!req.file) {
        return res.status(400).send("Please select an image");
    }
    const result = await uploadToCloudinary(
        req.file.buffer,
        "social-media/profile"
    );
    user.profilepic = result.secure_url;
    user.profilepicPublicId = result.public_id;

    await user.save();
    res.redirect("/profile");
}));


app.post('/post', isLoggedIn, upload.single('image'), asyncHandler(async (req, res) => {
    let { content } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).send("Post content cannot be empty");
    }
    if (content.length > 1000) {
        return res.status(400).send("Post is too long");
    }
    let user = await userModel.findOne({ email: req.user.email });

    let imageUrl = null;
    if (req.file) {
        const result = await uploadToCloudinary(
            req.file.buffer,
            "social-media/posts"
        );

        imageUrl = result.secure_url;

    }

    let post = await postModel.create({
        user: user._id,
        content: content,
        image: imageUrl
    })

    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
}));

app.get('/home', isLoggedIn, asyncHandler(async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });

    let page = parseInt(req.query.page) || 1;
    let limit = 10;
    let skip = (page - 1) * limit;
    let posts = await postModel.find().populate("user").sort({ createdAt: -1 }).skip(skip).limit(limit);

    let totalPosts = await postModel.countDocuments();
    let totalPages = Math.ceil(totalPosts / limit);
    res.render("home", { user, posts, page, totalPages });
}));

app.post('/like/:id', isLoggedIn, asyncHandler(async (req, res) => {
    let post = await postModel.findById(req.params.id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    if (post.likes.some(id => id.equals(req.user.userid))) {
        post.likes = post.likes.filter(id => !id.equals(req.user.userid));
    } else {
        post.likes.push(req.user.userid);
    }

    await post.save();

    const page = req.body.page || 1;

    res.redirect(`/home?page=${page}`);
}));

app.get('/edit/:id', isLoggedIn, asyncHandler(async (req, res) => {
    let post = await postModel.findById(req.params.id);
    if (!post) {
        return res.status(404).send("Post not found");
    }
    if (!post.user.equals(req.user.userid)) {
        return res.status(403).send("unauthorized");
    }
    res.render('edit', { post });
}));

app.post('/edit/:id', isLoggedIn, asyncHandler(async (req, res) => {
    let post = await postModel.findById(req.params.id);
    if (!post) {
        return res.status(404).send("Post not found");
    }
    if (!post.user.equals(req.user.userid)) {
        return res.status(403).send("Unauthorized");
    }
    post.content = req.body.content;
    await post.save();
    res.redirect('/profile');
}))


app.get('/user/:id', isLoggedIn, asyncHandler(async (req, res) => {
    const profileuser = await userModel.findById(req.params.id).populate("posts");
    if (!profileuser) {
        return res.status(404).send("User not found");
    }

    const currentuser = await userModel.findOne({
        email: req.user.email
    });
    const isFollowing = currentuser.following.some(id =>
        id.equals(profileuser._id)
    );

    res.render("userprofile", { profileuser, isFollowing });
}));

app.post('/user/:id/follow', isLoggedIn, asyncHandler(async (req, res) => {
    const currentuser = await userModel.findOne({ email: req.user.email });
    const profileuser = await userModel.findById(req.params.id);

    if (!profileuser) { return res.status(404).send("User not found") };
    if (currentuser._id.toString() === profileuser._id.toString()) {
        return res.status(400).send("You cannot follow yourself");
    };
    if (currentuser.following.some(id => id.equals(profileuser._id))) {
        return res.status(400).send("Already following");
    }
    currentuser.following.push(profileuser._id);
    profileuser.followers.push(currentuser._id);

    await currentuser.save();
    await profileuser.save();

    res.redirect(`/user/${profileuser._id}`);
}));

app.post('/user/:id/unfollow', isLoggedIn, asyncHandler(async (req, res) => {
    const currentuser = await userModel.findOne({ email: req.user.email });
    const profileuser = await userModel.findById(req.params.id);

    if (!profileuser) {
        return res.status(404).send("User not found");
    }
    currentuser.following.pull(profileuser._id);
    profileuser.followers.pull(currentuser._id);

    await currentuser.save();
    await profileuser.save();
    res.redirect(`/user/${profileuser._id}`);
}));


app.get('/comments/:postId', isLoggedIn, asyncHandler(async (req, res) => {
    const comments = await commentModel.find({ post: req.params.postId }).populate("user").sort({ date: -1 });
    res.json(comments);

}));


app.post('/comment/:postId', isLoggedIn, asyncHandler(async (req, res) => {
    const { content } = req.body;

    const post = await postModel.findById(req.params.postId);

    if (!post) { 
        return res.status(404).send("Post not found"); 
    }

    if (!content || !content.trim()) {
        return res.status(400).send("content cannot be empty");
    }

    const user = await userModel.findOne({ email: req.user.email });

    const comment = await commentModel.create({
        user: user._id,
        post: post._id,
        content: content
    });

    const page = req.body.page || 1;

    res.redirect(`/home?page=${page}`);
}));

app.post('/delete-comment/:id', isLoggedIn, asyncHandler(async (req, res) => {
    const comment = await commentModel.findById(req.params.id);

    if (!comment) {
        return res.status(404).send("Comment not found");
    }

    if (!comment.user.equals(req.user.userid)) {
        return res.status(403).send("Unauthorized");
    }

    await commentModel.findByIdAndDelete(req.params.id);

    const page = req.body.page || 1;

    res.redirect(`/home?page=${page}`);
}));


app.post('/ai/grammar', isLoggedIn, asyncHandler(async (req, res) => {

    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({
            error: "Please write something first"
        });
    }

    if (content.length > 1000) {
        return res.status(400).json({
            error: "Post is too long"
        });
    }

    const response = await fetch( "https://api.languagetool.org/v2/check", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ text: content, language: "en-US" })
        }
    );

    const data = await response.json();

    res.json(data);
}));


app.post('/delete/:id', isLoggedIn, asyncHandler(async (req, res) => {
    let post = await postModel.findById(req.params.id);
    if (!post) { return res.status(404).send("address not found"); }
    if (!post.user.equals(req.user.userid)) {
        return res.status(403).send("Unauthorized");
    }
    await commentModel.deleteMany({
        post: post._id
    });
    await postModel.findByIdAndDelete(req.params.id);
    let user = await userModel.findById(req.user.userid);
    user.posts = user.posts.filter(id => !id.equals(req.params.id));
    await user.save();
    res.redirect('/profile');
}));

app.post('/logout', (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    });
    res.redirect('/login')
})

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login')
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data;
        next();
    } catch (error) {
        return res.redirect('/login');
    }

}

app.use((err, req, res, next) => {
    console.error(err);

     // Multer: file too large
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send("File size must be less than 5 MB");
    }

    // Multer: invalid file type
    if (err.message === "Only JPEG, PNG, and WebP images are allowed.") {
        return res.status(400).send(err.message);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).send("Invalid data");
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        return res.status(400).send("Invalid ID");
    }

    res.status(500).send("Something went wrong");
})






const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listining on port ${PORT}`);
})