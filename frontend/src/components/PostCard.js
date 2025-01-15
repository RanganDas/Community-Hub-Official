import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PostCard.css";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons"; // Import the solid star icon
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserModal from "./UserModal";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes || 0); // Initialize likes from the post
  const [isLiked, setIsLiked] = useState(post.isLiked || false); // Initialize based on backend data
  const URL = "https://sparklify-official.onrender.com";
  const [isFavorite, setIsFavorite] = useState(post.isFavorite || false);

  const [favoritesCount, setFavoritesCount] = useState(post.favoritesCount || 0);

  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userImage, setUserImage] = useState("./empty.png"); // Default placeholder image

  useEffect(() => {
    if (post.user?._id) {
      fetchUserImage(); // Fetch user image when component mounts
    }
  }, [post.user?._id]);

  const fetchUserImage = async () => {
    try {
      const response = await axios.get(
        `${URL}/api/users/${post.user?._id}/image`, // Backend route for fetching user image
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUserImage(response.data.imageUrl || "./empty.png"); // Update user image or use default
    } catch (error) {
      console.error("Error fetching user image:", error);
      setUserImage("./empty.png"); // Use default image on error
    }
  };

  const handleFavorite = async () => {
    try {
      const response = await axios.put(
        `${URL}/api/posts/${post._id}/favourite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Pass token for authentication
          },
        }
      );
      if (response.status === 200) {
        setIsFavorite(response.data.isFavorite); // Update favorite status based on the response
        setFavoritesCount(response.data.favoritesCount); // Optionally update the total number of favorites
      }
    } catch (error) {
      toast.error("You have to login first to mark a post as favorite");
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.put(
        `${URL}/api/posts/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setLikes(response.data.likes); // Update like count
        setIsLiked(response.data.isLiked); // Update like state
      }
    } catch (error) {
      toast.error("You have to login first to like a post");
    }
  };

  const handleUserClick = async () => {
    try {
      const response = await axios.get(
        `${URL}/api/users/${post.user?._id}`, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUserInfo(response.data);
      setShowModal(true); // Open the modal
    } catch (err) {
      if (err.status === 401) {
        toast.error("You have to login first to visit other user profiles");
      }
      if (err.status === 404) {
        toast.error("User not found");
      }
      if (err.status === 500) {
        toast.error("User not found");
      }
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // getMonth() returns months 0-11, so add 1 for correct month
    const year = date.getFullYear();

    return `${day} / ${month} / ${year}`;
  };

  const postDate = formatDate(post.createdAt);

  return (
    <div className="post-card">
      <div className="post-header">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleUserClick();
          }}
        >
          <p className="post-username">
            <img
              src={userImage} // Display fetched user image
              alt="User"
              className="post-user-image" // Optional: add a class for styling
            />
            {post.user?.username || "Unknown"} posted:
          </p>
        </a>
        <p className="post-date2">{postDate}</p>
      </div>
      <p className="post-location">
        <FontAwesomeIcon
          icon={faLocationDot}
          style={{ color: "#63E6BE", marginRight: "8px" }}
        />
        {post.location}
      </p>
      {post.imageUrl && (
        <div className="post-image-container">
          <img src={post.imageUrl} alt="Post" className="post-image" />
        </div>
      )}

      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>

      <p className="post-hashtags">
        {" "}
        {post.hashtags.map((hashtag, index) => (
          <span key={index} className="hashtag-box">
            # {hashtag}
          </span>
        ))}
      </p>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {/* Like button */}
        <div className="like-section">
          <p
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "1.2rem", // Adjust the size for better appearance
              marginLeft: "10px",
            }}
            onClick={handleLike}
          >
            <FontAwesomeIcon
              size="lg"
              icon={isLiked ? solidHeart : regularHeart}
              style={{
                marginRight: "8px",
                color: isLiked ? "#df67bf" : "#df67bf", // Red for liked, black for unliked
              }}
            />
          </p>
          <span className="like-count">{likes}</span>
        </div>

        {/* Favorite button */}
        <div className="favorite-section">
          <p
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
            onClick={handleFavorite}
          >
            <FontAwesomeIcon
              size="lg"
              icon={isFavorite ? solidStar : regularStar} // Use solid star for favorited, regular star for not
              style={{
                marginRight: "8px",
                color: isFavorite ? "#FFD700" : "#FFD700", // Gold color for favorited, gray for not
              }}
            />
            <span className="favorite-count">{favoritesCount}</span>
          </p>
        </div>
      </div>

      {showModal && (
        <UserModal
          userInfo={userInfo}
          onClose={() => setShowModal(false)} // Close the modal
        />
      )}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default PostCard;
