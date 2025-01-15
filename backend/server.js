const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("./models/usersignup");
const Post = require("./models/Post");
const Message = require("./models/Message");
const Story = require("./models/Story");
const app = express();
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middlewire/authMiddleware");
const moment = require("moment");
const axios = require("axios");

app.use(express.json());
app.use(cors());

require("dotenv").config();

//const API_KEY = process.env.API_KEY;
// Temporary storage for unverified user data (could be Redis or another solution in production)
const unverifiedUsers = new Map();

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Connected to database successfully");
    //TTL index for stories
    Story.createIndexes()
      .then(() => console.log("TTL index ensured on 'expiresAt' field."))
      .catch((err) => console.error("Error creating TTL index:", err));
  })
  .catch((err) => console.error("Error connecting to database", err));

app.get("/", (req, res) => {
  res.send("Home page");
});

const PORT = process.env.PORT || 5000;

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Set up Nodemailer transport (using Gmail for this example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Verify Your Email Address",
    text: `Your 6-digit verification code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Register route (saves user data temporarily, sends verification code)
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already exists" });
  }

  // Generate the 6-digit verification code
  const verificationCode = generateVerificationCode();

  // Hash the password to be stored after verification
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Store user data and verification code in temporary storage
  unverifiedUsers.set(email, {
    username,
    email,
    password: hashedPassword,
    verificationCode,
  });

  // Send the verification email
  await sendVerificationEmail(email, verificationCode);

  res.status(201).json({ message: "Verification code sent to email." });
});

// Verify route (checks code and saves user if verified)
app.post("/api/verify", async (req, res) => {
  const { email, verificationCode } = req.body;

  // Retrieve the unverified user data
  const unverifiedUser = unverifiedUsers.get(email);

  if (!unverifiedUser) {
    return res
      .status(404)
      .json({ message: "No pending verification for this email" });
  }

  // Check if the code matches
  if (unverifiedUser.verificationCode !== parseInt(verificationCode, 10)) {
    return res.status(400).json({ message: "Invalid verification code" });
  }

  // Create and save the user in the database
  const newUser = new User({
    username: unverifiedUser.username,
    email: unverifiedUser.email,
    password: unverifiedUser.password,
    isVerified: true,
  });
  await newUser.save();

  // Remove the user from temporary storage
  unverifiedUsers.delete(email);
  const token = jwt.sign(
    { id: newUser._id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
  // After successful login

  res.status(200).json({
    message: "Email verified successfully. You can now log in.",
    token,
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate verification code and save it temporarily
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    // Send code to user's email
    await sendVerificationEmail(email, verificationCode);
    res.status(200).json({ message: "Verification code sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

app.post("/api/verify-login", async (req, res) => {
  const { email, verificationCode } = req.body;
  console.log("Received email:", email, "Verification Code:", verificationCode); // Log input

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.verificationCode !== parseInt(verificationCode)) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Clear verification code after successful login
    user.verificationCode = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.status(200).json({ message: "Login verified successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Error verifying login", error });
  }
});



app.post("/api/forget-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const verificationCode = generateVerificationCode(); // Ensure a 6-digit code is generated
    user.verificationCode = verificationCode;
    await user.save();

    console.log("Generated OTP for user:", verificationCode); // Log OTP
    await sendVerificationEmail(email, verificationCode); // Email OTP to the user
    res.status(200).json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("Error generating OTP:", error); // Log error
    res.status(500).json({ message: "Error logging in", error });
  }
});



app.post("/api/verify-password", async (req, res) => {
  const { email, verificationCode } = req.body;
  console.log("Received email:", email, "Verification Code:", verificationCode); // Log received data

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Stored OTP:", user.verificationCode, "Type:", typeof user.verificationCode);
    console.log("Input OTP:", verificationCode, "Type:", typeof verificationCode);

    if (String(user.verificationCode) !== String(verificationCode)) { // Ensure both are compared as strings
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Clear verification code after successful verification
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Error verifying email", error });
  }
});



app.post("/api/create-new-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the new password matches the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password cannot be the same as the old password." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Failed to update password.", error });
  }
});




app.get("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    // Find the user using the user ID decoded from the token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the user profile data, excluding sensitive information like the password
    res.json({
      username: user.username,
      email: user.email,
      bio: user.bio || "Add info", // Display 'Add info' if not available
      phoneNumber: user.phoneNumber || "Add info", // Display 'Add info' if not available
      city: user.city || "Add info", // Display 'Add info' if not available
      dateOfBirth: user.dateOfBirth || "Add info", // Display 'Add info' if not available
      job: user.job || "Add info", // Display 'Add info' if not available
      age: user.age || "Add info", // Display 'Add info' if not available
      following: user.following.length || 0,
      followers: user.followers.length || 0,
      imageUrl: user.imageUrl || "Add info", // Display 'Add info' if not available
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user profile", error });
  }
});

app.get("/api/user/settings-profile", authMiddleware, async (req, res) => {
  try {
    // Find the user using the user ID decoded from the token
    const user = await User.findById(req.user.id).populate([
      { path: "likedPosts", select: "title" }, // Include liked posts details
      { path: "favorites", select: "title" }, // Include favorites details
      { path: "following", select: "username" }, // Include following details
      { path: "followers", select: "username" }, // Include followers details
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Aggregate data for response
    const totalLikes = user.likedPosts.length;
    const totalFavorites = user.favorites.length;
    const totalFollowing = user.following.length;
    const totalFollowers = user.followers.length;

    res.json({
      username: user.username,
      email: user.email,
      bio: user.bio || "Add info",
      phoneNumber: user.phoneNumber || "Add info",
      city: user.city || "Add info",
      dateOfBirth: user.dateOfBirth || "Add info",
      job: user.job || "Add info",
      age: user.age || "Add info",
      imageUrl: user.imageUrl || "Add info",
      totalLikes,
      totalFavorites,
      totalFollowing,
      totalFollowers,
      likedPosts: user.likedPosts, // Include post details
      favorites: user.favorites, // Include post details
      following: user.following, // Include usernames of following users
      followers: user.followers, // Include usernames of followers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching settings profile", error });
  }
});


// Update user profile route
app.put("/api/user/profile/update", authMiddleware, async (req, res) => {
  try {
    const { bio, phoneNumber, city, dateOfBirth, job, age, imageUrl } =
      req.body;

    // Find the user using the user ID from the decoded token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user profile data
    user.bio = bio || user.bio;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.city = city || user.city;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.job = job || user.job;
    user.age = age || user.age;
    user.imageUrl = imageUrl || user.imageUrl;

    // Save the updated profile
    await user.save();
    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Create a new post
app.post("/api/posts/createpost", authMiddleware, async (req, res) => {
  try {
    const { title, content, hashtags, location, imageUrl } = req.body;

    // Check if all required fields are provided
    if (!title || !content || !hashtags || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPost = new Post({
      title,
      content,
      hashtags,
      location,
      imageUrl,
      user: req.user.id,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error.message); // Log the actual error message
    res.status(500).json({ message: error.message || "Error creating post" });
  }
});

// Get all posts
app.get("/api/posts/getposts", async (req, res) => {
  console.log("GET /api/posts/getposts called with query:", req.query);
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is specified
    const limit = 10; // Number of posts per page
    const skip = (page - 1) * limit; // Skip posts based on the page number

    // Fetch posts with pagination
    const posts = await Post.find()
      .populate("user", "username") // Populate user data if needed
      .sort({ createdAt: -1 }) // Sort posts by the most recent
      .skip(skip)
      .limit(limit)
      .lean();

    // Get the total number of posts to calculate total pages
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    // Send paginated posts and total page information
    res.status(200).json({ posts, totalPages });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Route to fetch posts of a logged-in user
app.get("/api/user/posts", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Get the user ID from the JWT token

    // Fetch posts by the user
    const userPosts = await Post.find({ user: userId }).lean(); // Use `.lean()` to modify the result object

    // Fetch the user's liked posts
    const user = await User.findById(userId);

    // Add `isLiked` to each post
    userPosts.forEach((post) => {
      post.isLiked = user.likedPosts.includes(post._id.toString());
    });

    res.json(userPosts); // Send the modified posts as a response
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: err.message });
  }
});

// In server.js or routes file
app.delete("/api/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
});

// server.js or routes file
app.put("/api/posts/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, content, hashtags, location, imageUrl } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      { title, content, hashtags, location, imageUrl },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error });
  }
});

// Routes for liking posts
app.put("/api/posts/:postId/like", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already liked the post
    const isLiked = user.likedPosts.includes(postId);

    if (isLiked) {
      // If already liked, remove like
      post.likes = post.likes > 0 ? post.likes - 1 : 0;
      user.likedPosts = user.likedPosts.filter(
        (id) => id.toString() !== postId
      );
    } else {
      // If not liked, add like
      post.likes += 1;
      user.likedPosts.push(postId);

      // Attempt to fetch the target user (post owner)
      const targetUser = await User.findById(post.user);

      if (targetUser && userId !== post.user.toString()) {
        // Add a notification to the target user if the liker is not the owner
        const notification = {
          message: `${user.username} liked your post`,
          timestamp: new Date().toISOString(),
        };
        targetUser.notifications.push(notification);
        await targetUser.save(); // Save the target user's updated notifications
      } else if (userId === post.user.toString()) {
        console.warn("Self-like detected; skipping notification.");
      }
    }

    await post.save();
    await user.save();

    res.status(200).json({ likes: post.likes, isLiked: !isLiked });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
});

app.put("/api/posts/:postId/favourite", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorite = user.favorites.includes(postId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(
        (favPostId) => !favPostId.equals(postId)
      );
      post.favoritesCount = Math.max(post.favoritesCount - 1, 0); // Decrement count
    } else {
      user.favorites.push(postId);
      post.favoritesCount += 1; // Increment count
    }

    await user.save();
    await post.save();

    res.status(200).json({
      isFavorite: !isFavorite,
      favoritesCount: post.favoritesCount, // Return the updated favorites count from the Post
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Error toggling favorite" });
  }
});

app.get("/api/users/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user details
    const user = await User.findById(userId).select("-password"); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user details" });
  }
});

app.get("/api/user/image", authMiddleware, async (req, res) => {
  try {
    // Find user by ID from the token and fetch both imageUrl and username
    const user = await User.findById(req.user.id, "username imageUrl"); // Fetch only username and imageUrl fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return both username and imageUrl
    res.json({
      username: user.username,
      imageUrl: user.imageUrl || "./empty.png", // Default if imageUrl is not set
    });
  } catch (error) {
    console.error("Error fetching user image and username:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/users/:id/image", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ imageUrl: user.imageUrl || null });
  } catch (err) {
    res.status(500).json({ message: "Error fetching image" });
  }
});

app.get("/api/people/users", authMiddleware, async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Return only relevant user details (e.g., username, bio, profile picture)
    const userDetails = users.map((user) => ({
      _id: user._id,
      username: user.username,
      bio: user.bio || "No bio available",
      profilePicture: user.imageUrl || "./empty.png", // Default image if not set
      age: user.age || "No age available",
      job: user.job || "No job available",
      phoneNumber: user.phoneNumber || "No contact available",
      city: user.city || "No city available",
      imageUrl: user.imageUrl || "./empty.png",
      following: user.following.length || 0,
      followers: user.followers.length || 0,
    }));

    res.status(200).json(userDetails);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/people/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDetails = {
      username: user.username,
      bio: user.bio || "No bio available",
      profilePicture: user.imageUrl || "./empty.png",
      age: user.age || "No age available",
      job: user.job || "No job available",
      phoneNumber: user.phoneNumber || "No contact available",
      city: user.city || "No city available",
      following: user.following.length || 0,
      followers: user.followers.length || 0,
    };
    const isFollowing = req.user ? user.followers.includes(req.user.id) : false;
    res.status(200).json({ userDetails, isFollowing });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (currentUser._id.equals(targetUser._id)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Avoid duplicate following
    if (!currentUser.following.includes(req.params.id)) {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user.id);

      // Add a notification to the target user
      const notification = {
        message: `${currentUser.username} supported you`,
        timestamp: moment().toISOString(),
      };
      targetUser.notifications.push(notification);

      await currentUser.save();
      await targetUser.save();

      io.to(targetUser._id.toString()).emit("newNotification", notification);
    }

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Error in follow route:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/unfollow/:id", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser._id.equals(targetUser._id)) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    // Remove the relationship if it exists
    currentUser.following = currentUser.following.filter(
      (userId) => userId.toString() !== req.params.id
    );
    targetUser.followers = targetUser.followers.filter(
      (userId) => userId.toString() !== req.user.id
    );

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Error unfollowing user" });
  }
});

app.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "followers following username"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.followers.includes(req.user.id);

    res.status(200).json({ user, isFollowing });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details" });
  }
});

app.get("/api/users/following", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "following",
      "username profilePicture"
    );
    console.log(user.following); // Check the values of the 'following' array
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: "Error fetching following data" });
    console.error(err);
  }
});

app.get("/api/mycircle", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("following", "username profilePicture imageUrl bio")
      .populate("followers", "username profilePicture imageUrl bio");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Identify mutual followers by checking for intersection
    const mutualFollowers = user.followers.filter((follower) =>
      user.following.some((following) => following.id === follower.id)
    );

    res.status(200).json({
      following: user.following,
      followers: user.followers,
      mutualfollowers: mutualFollowers, // Send mutual followers
    });
  } catch (error) {
    console.error("Error fetching circle data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/chats", authMiddleware, async (req, res) => {
  const { userId, friendId } = req.query;

  if (!userId || !friendId) {
    return res.status(400).json({ error: "userId and friendId are required." });
  }

  const chatId = [userId, friendId].sort().join("_");
  console.log("Backend Chat ID:", chatId); // Log chatId

  try {
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    console.log("Messages fetched:", messages); // Log fetched messages
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get the logged-in user's information
app.get("/api/user", authMiddleware, async (req, res) => {
  try {
    // `req.user` should be populated by the authMiddleware
    const userId = req.user.id; // Extract user ID from the token
    const user = await User.findById(userId).select("_id username email"); // Fetch user details from DB
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ userId: user._id, username: user.username });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Send a message to a friend
app.post("/api/messages", authMiddleware, async (req, res) => {
  try {
    // Extract the senderId from the decoded JWT token (attached to req.user by the middleware)
    const senderId = req.user.id; // Assuming the JWT has the user id in it
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res
        .status(400)
        .json({ message: "ReceiverId and text are required." });
    }

    // Generate a unique chatId using senderId and receiverId
    const chatId = [senderId, receiverId].sort().join("_"); // Ensure the chatId is the same regardless of the order of sender and receiver

    // Create a new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      chatId,
    });

    // Save the message to the database
    await newMessage.save();

    res.status(200).json(newMessage);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
});

// Delete chats
app.delete("/api/chats", authMiddleware, async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required." });
  }

  try {
    await Message.deleteMany({ chatId });
    res.status(200).json({ message: "Chat deleted successfully." });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Failed to delete chat." });
  }
});

const http = require("http");
const { Server } = require("socket.io");

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// Track online users
const onlineUsers = new Map();

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Add a user to the online users map
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User joined:", userId);

    // Notify all clients about the updated online users
    io.emit("userStatusUpdate", Array.from(onlineUsers.keys()));
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    const chatId = [senderId, receiverId].sort().join("_");

    // Save the message in the database
    const newMessage = new Message({ senderId, receiverId, text, chatId });
    await newMessage.save();

    // Send the message to the receiver if online
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", newMessage);
    }
  });

  socket.on("userTyping", ({ receiverId, senderName }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { senderId: socket.id, senderName });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);

        // Notify all clients about the updated online users
        io.emit("userStatusUpdate", Array.from(onlineUsers.keys()));
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete(
  "/notifications/:notificationId",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { notificationId } = req.params;

      const notificationIndex = user.notifications.findIndex(
        (notification) => notification._id.toString() === notificationId
      );

      if (notificationIndex === -1) {
        return res.status(400).json({ message: "Notification not found" });
      }

      // Remove the notification
      user.notifications.splice(notificationIndex, 1);
      await user.save();

      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.get("/api/count/notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ notificationCount: user.notifications.length }); // Return an object
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/notifications", authMiddleware, async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clear all notifications
    user.notifications = [];
    await user.save();

    res.status(200).json({ message: "All notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting all notifications:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/users/favorites/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).select("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error("Error fetching favorite posts:", error);
    res.status(500).json({ message: "Error fetching favorite posts" });
  }
});

app.get("/api/auth/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("id username email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ userId: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch posts by IDs
app.post("/api/posts/details", async (req, res) => {
  const { postIds } = req.body;

  if (!postIds || !Array.isArray(postIds)) {
    return res.status(400).json({ message: "Invalid post IDs" });
  }

  try {
    const posts = await Post.find({ _id: { $in: postIds } }).populate(
      "user",
      "username email"
    );
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

app.get("/api/users/favorites", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error("Error fetching favorite posts:", error);
    res.status(500).json({ message: "Error fetching favorite posts" });
  }
});

app.post("/api/stories", authMiddleware, async (req, res) => {
  try {
    const { imageUrl, caption } = req.body;

    // Check if caption is provided (image is optional)
    if (!caption) {
      return res.status(400).json({ message: "Caption is required." });
    }

    // Create a new Story object with the optional imageUrl
    const newStory = new Story({
      user: req.user.id,
      imageUrl: imageUrl || null, // Set imageUrl to null if not provided
      caption,
    });

    await newStory.save();

    res
      .status(201)
      .json({ message: "Story uploaded successfully.", story: newStory });
  } catch (error) {
    console.error("Error uploading story:", error);
    res.status(500).json({ message: "Server error." });
  }
});

app.get("/api/fetchstories", authMiddleware, async (req, res) => {
  try {
    const stories = await Story.find()
      .populate("user", "username")
      .sort({ createdAt: -1 });
    const groupedStories = stories.reduce((acc, story) => {
      if (!acc[story.user._id]) {
        acc[story.user._id] = { user: story.user, stories: [] };
      }
      acc[story.user._id].stories.push(story);
      return acc;
    }, {});

    res.status(200).json({ groupedStories: Object.values(groupedStories) });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Server error." });
  }
});

app.delete("/api/stories/:id", authMiddleware, async (req, res) => {
  try {
    const storyId = req.params.id;
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    // Ensure the story belongs to the authenticated user
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    await Story.findByIdAndDelete(storyId);

    res.status(200).json({ message: "Story deleted successfully." });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({ message: "Server error." });
  }
});

app.get("/api/following", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "following",
      "username _id"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ following: user.following });
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ message: "Server error." });
  }
});

app.get("/api/stories/following", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("following");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Include the logged-in user's ID in the list of following IDs
    const followingIds = user.following.map((followedUser) => followedUser._id);
    followingIds.push(user._id); // Add the user's own ID

    // Fetch stories from the user and their following
    const stories = await Story.find({ user: { $in: followingIds } }).populate(
      "user",
      "username"
    );

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = { user: story.user, stories: [] };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    res.status(200).json({ groupedStories: Object.values(groupedStories) });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Server error." });
  }
});

app.get("/api/users/liked/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.likedPosts); // Assuming `likedPosts` is an array in the User schema
  } catch (error) {
    console.error("Error fetching liked post IDs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        country: "us",
        pageSize: 40,
        apiKey: "b508735890aa443dbc65da25a39253a1",
      },
    });
    console.log("NewsAPI Response:", response.data); // Log the API response
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching news:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch news" });
  }
});


app.delete("/api/user/delete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Optional: Remove related data like posts, comments, etc.
    //await Post.deleteMany({ user: userId }); // Remove posts by this user
    // Add more cascading deletions if needed (e.g., comments, likes, etc.)

    // Delete the user from the database
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


app.get("/api/user/stats/graph", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // Assuming req.user contains the authenticated user's data
    console.log("Received user ID:", userId);
    // Date range for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Aggregation pipeline
    const userStats = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          likedPosts: 1,
          favorites: 1,
        },
      },
      {
        $unwind: "$likedPosts", // Unwind likedPosts to work with each individual like
      },
      {
        $match: {
          "likedPosts.date": { $gte: startDate, $lte: endDate }, // Filter likes within the date range
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$likedPosts.date" } }, // Group by date
          likesCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending
      },
      {
        $project: {
          date: "$_id",
          likes: "$likesCount",
          _id: 0,
        },
      },
    ]);

    // Aggregation for favorites
    const favoriteStats = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          favorites: 1,
        },
      },
      {
        $unwind: "$favorites", // Unwind favorites to work with each individual favorite
      },
      {
        $match: {
          "favorites.date": { $gte: startDate, $lte: endDate }, // Filter favorites within the date range
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$favorites.date" } }, // Group by date
          favoritesCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending
      },
      {
        $project: {
          date: "$_id",
          favorites: "$favoritesCount",
          _id: 0,
        },
      },
    ]);

    // Merge the results of likes and favorites
    const graphData = mergeStats(userStats, favoriteStats);

    res.json({ data: graphData });
  } catch (error) {
    console.error("Error fetching graph data:", error.stack);
    res.status(500).json({ message: "Error fetching graph data", error: error.message });
  }
});

// Helper function to merge the results
function mergeStats(likesStats, favoritesStats) {
  const merged = {};

  // Add likes to merged object
  likesStats.forEach(stat => {
    merged[stat.date] = { likes: stat.likes };
  });

  // Add favorites to merged object (if any)
  favoritesStats.forEach(stat => {
    if (!merged[stat.date]) {
      merged[stat.date] = { favorites: stat.favorites };
    } else {
      merged[stat.date].favorites = stat.favorites;
    }
  });

  // Convert merged object into an array for response
  return Object.keys(merged).map(date => {
    return {
      date: date,
      likes: merged[date].likes || 0,
      favorites: merged[date].favorites || 0,
    };
  });
}





