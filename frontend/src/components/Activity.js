import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PostCard from "./PostCard"; // Import the PostCard component
import { useNavigate } from "react-router-dom";
const Activity = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const URL = "https://sparklify-official.onrender.com";


  // Fetch the user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(
          `${URL}/api/auth/user`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserId(response.data.userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
        toast.error("Error fetching user ID");
      }
    };

    fetchUserId();
  }, []);

  // Fetch liked posts once userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchLikedPosts = async () => {
      try {
        // Fetch liked post IDs
        const likedResponse = await axios.get(
          `${URL}/api/users/liked/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const postIds = likedResponse.data;

        // Fetch full details of liked posts
        const postsResponse = await axios.post(
          `${URL}/api/posts/details`,
          { postIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setLikedPosts(postsResponse.data);
      } catch (error) {
        console.error("Error fetching liked posts:", error);
        toast.error("Error fetching liked posts");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPosts();
  }, [userId]);

  // Handle Like/Dislike
  const handleLikeToggle = async (postId) => {
    try {
      // Call backend to toggle like state
      const response = await axios.put(
        `${URL}/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        // Remove the disliked post from likedPosts
        setLikedPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        toast.success("Post unliked and removed from your liked posts!"); // Use toast for success notification
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Error toggling like");
    }
  };

  return (
    <div className="liked-posts-container">
     
      <nav className="navbar3">
        <div className="navbar-container3">
          <h2 className="navbar-title3" onClick={() => navigate("/")}>
            Activity
          </h2>
          <div className="navbar-links3">
            <button onClick={() => navigate("/")}>Back</button>
          </div>
        </div>
      </nav>
      <div className="posts-container3">
      {loading ? (
        <p style={{ textAlign: "center" }} >Loading liked posts...</p>
      ) : (
        <div>
          
          <div className="post-cards" style={{ margin: "20px" }}>
            {likedPosts.length === 0 ? (
              <p style={{ textAlign: "center" }}>No liked posts found.</p>
            ) : (
              likedPosts.map((post) => (
                <PostCard 
                  key={post._id}
                  post={post}
                  onLikeToggle={() => handleLikeToggle(post._id)}
                />
              ))
            )}
          </div>
        </div>
      )}
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default Activity;
