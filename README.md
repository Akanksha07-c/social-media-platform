# SocialApp — Full-Stack Social Media Platform

A full-stack social media application built with **Node.js, Express.js, MongoDB, Mongoose, EJS, Tailwind CSS, JWT, bcrypt, Cloudinary, and LanguageTool API**.

The project focuses on practical full-stack engineering: authentication, authorization, CRUD operations, database relationships, image uploads, pagination, asynchronous frontend interactions, error handling, and AI-assisted writing.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration and login
- Password hashing with **bcrypt**
- **JWT-based authentication**
- JWT stored in an **HTTP-only cookie**
- Protected routes using `isLoggedIn` middleware
- Ownership checks for editing/deleting posts
- Follow/unfollow functionality

### 👤 User Profiles
- Personal profile pages
- Profile picture upload
- Followers/following system
- View other users' profiles
- User-post relationships

### 📝 Posts
- Create text and image posts
- Edit and delete own posts
- Like / unlike posts
- Post timestamps using Mongoose `createdAt` / `updatedAt`
- Server-side pagination with 10 posts per page

### 💬 Comments
- Add comments to posts
- Load comments asynchronously using Fetch API
- Comments reference both users and posts
- Related comments are removed when a post is deleted

### 🖼️ Image Uploads
- Multer handles multipart uploads
- 5 MB upload limit
- Cloudinary stores profile and post images
- MongoDB stores the Cloudinary image URL

### 🤖 AI-Assisted Grammar Improvement

The post editor includes an **Improve Grammar** feature powered by the **LanguageTool API**.

Flow:

```text
Post Editor
    ↓
POST /ai/grammar
    ↓
Express validation
    ↓
LanguageTool API
    ↓
Grammar suggestions
    ↓
Frontend applies corrections
    ↓
Improved post text
```

The endpoint validates empty content and the 1000-character post limit before calling LanguageTool.

> This is an external NLP/API integration, not a custom-trained AI model.

---

## 🛠️ Tech Stack

| Technology | Use |
|---|---|
| Node.js | Backend runtime |
| Express.js | Server and routing |
| MongoDB | Database |
| Mongoose | ODM and schema design |
| EJS | Server-side rendering |
| Tailwind CSS | UI styling |
| JavaScript | Client-side interactions |
| JWT | Authentication |
| bcrypt | Password hashing |
| Multer | File uploads |
| Cloudinary | Image storage |
| LanguageTool API | Grammar/NLP assistance |
| Fetch API | Asynchronous requests |
| Nodemon | Development |
| dotenv | Environment configuration |

---

## 🏗️ Architecture

The application uses a lightweight MVC-style organization:

```text
SocialApp/
├── app.js
├── config/
├── models/
├── utils/
├── views/
├── public/
├── .env.sample
├── .gitignore
├── package.json
└── package-lock.json
```

### Main Models

**User**
- username
- name
- email
- password
- profile picture
- followers
- following
- posts
- timestamps

**Post**
- user
- content
- image
- likes
- timestamps

**Comment**
- user
- post
- content
- timestamps

Relationships:

```text
User ──────→ Posts
 │
 ├──────────→ Followers / Following
 │
 └──────────→ Comments

Post ───────→ Comments
Post ───────→ Likes
```

---

## 🔒 Security & Engineering

The project implements several backend reliability and security practices:

- bcrypt password hashing
- JWT authentication
- HTTP-only authentication cookies
- Protected routes
- Ownership-based authorization
- Input validation
- 1000-character post limit
- 5 MB upload limit
- Mongoose validation
- Invalid MongoDB ObjectId handling
- Centralized Express error handling
- `asyncHandler` for asynchronous route errors
- Database cleanup when deleting posts
- Mongoose automatic timestamps

---

## 📡 Important Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/register` | Register user |
| POST | `/login` | Login |
| POST | `/logout` | Logout |
| GET | `/home` | Paginated feed |
| POST | `/post` | Create post |
| GET/POST | `/edit/:id` | Edit post |
| POST | `/delete/:id` | Delete post |
| POST | `/like/:id` | Like/unlike |
| GET | `/user/:id` | View user |
| POST | `/user/:id/follow` | Follow |
| POST | `/user/:id/unfollow` | Unfollow |
| GET | `/comments/:postId` | Load comments |
| POST | `/comment/:postId` | Add comment |
| POST | `/ai/grammar` | Grammar assistance |

---

## 🗄️ Database & Data Handling

MongoDB/Mongoose is used for persistent application data.

Posts and comments use references between documents rather than embedding all data into a single document.

When a post is deleted:

```js
await commentModel.deleteMany({
    post: post._id
});
```

This prevents orphaned comment documents.

Mongoose timestamps provide:

```text
createdAt
updatedAt
```

for users, posts, and comments.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Use `.env.sample` as the template.

Required configuration includes:

```env
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CSRF_SECRET=
NODE_ENV=
PORT=
```

### 4. Run the application

```bash
npm run dev
```

or:

```bash
npm start
```

Default:

```text
http://localhost:3000
```

**Never commit the real `.env` file or secret credentials to GitHub.**

---

## 🧪 Testing

The application has been manually tested for:

- Registration and login
- Logout
- Protected routes
- Profile access and image upload
- Post creation/editing/deletion
- Image posts
- Like/unlike
- Follow/unfollow
- Comment creation
- Pagination
- Invalid IDs and input
- Upload-size errors
- Error handling
- Timestamp display
- Unauthorized post actions

---

## 👨‍💻 Implementation Highlights

This project demonstrates hands-on experience with:

- Full-stack web development
- Express routing and middleware
- MongoDB/Mongoose schema design
- Authentication and authorization
- CRUD operations
- Database relationships
- Pagination
- File uploads and Cloudinary
- Asynchronous JavaScript / Fetch API
- External API integration
- NLP/AI-assisted functionality
- Input validation
- Centralized error handling
- Git/GitHub workflow

---

## 📌 Resume Description

**SocialApp — Full-Stack Social Media Platform**  
*Node.js, Express.js, MongoDB, Mongoose, EJS, Tailwind CSS, JWT, bcrypt, Cloudinary, LanguageTool API*

- Developed a full-stack social media platform with JWT authentication, bcrypt password hashing, protected routes, and ownership-based authorization.
- Implemented posts, likes, comments, follow/unfollow relationships, user profiles, image uploads, and server-side pagination using MongoDB/Mongoose.
- Integrated Cloudinary for media storage and built asynchronous comment loading using the Fetch API.
- Integrated the LanguageTool API to provide grammar improvement for user-generated posts through a client-server NLP workflow.
- Added input validation, upload limits, centralized async error handling, timestamps, and database cleanup for deleted posts.

---

## 🔮 Future Improvements

Potential future improvements:

- Automated unit and integration testing
- Complete and verify CSRF protection for all state-changing requests
- Stronger file-content validation
- Rate limiting
- More structured controller/service layers
- Cloudinary asset deletion using stored `public_id`
- Database transactions for multi-document updates
- Real-time notifications or messaging
- Additional AI-powered features

---

