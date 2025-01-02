import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";
const Favourites = () => {
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  // Fetch the user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/user",
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

  // Fetch favorite posts
  useEffect(() => {
    if (!userId) return;

    const fetchFavoritePosts = async () => {
      try {
        const favoriteResponse = await axios.get(
          `http://localhost:5000/api/users/favorites/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const postIds = favoriteResponse.data;

        const postsResponse = await axios.post(
          "http://localhost:5000/api/posts/details",
          { postIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setFavoritePosts(postsResponse.data);
      } catch (error) {
        console.error("Error fetching favorite posts:", error);
        toast.error("Error fetching favorite posts");
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritePosts();
  }, [userId]);

  // Handle unfavorite logic
  const handleFavoriteToggle = async (postId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/posts/${postId}/favourite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the unfavorited post from the list
        setFavoritePosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        toast.success("Post removed from favorites!");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Error toggling favorite");
    }
  };

  return (
    <div className="favorites-container">
      <nav className="navbar3">
        <div className="navbar-container3">
          <h2 className="navbar-title3" onClick={() => navigate("/")}>
            Favourites
          </h2>
          <div className="navbar-links3">
            <button onClick={() => navigate("/")}>Back</button>
          </div>
        </div>
      </nav>
      
          <div className="posts-container3">
            {loading ? (
              <p>Loading favorite posts...</p>
            ) : (
              <div>
                <div className="post-cards" style={{ margin: "20px" }}>
                  {favoritePosts.length === 0 ? (
                    <p style={{ textAlign: "center" }}>
                      No favorite posts found.
                    </p>
                  ) : (
                    favoritePosts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onFavoriteToggle={() => handleFavoriteToggle(post._id)} // Pass unfavorite logic
                        isFavorite={true} // Pass favorite state to PostCard
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

export default Favourites;
