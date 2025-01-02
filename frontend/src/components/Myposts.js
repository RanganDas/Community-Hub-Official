import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MypostCard from "./MypostCard"; // Assuming MypostCard component is ready
import EditModal from "./EditModal";
import "./Myposts.css";
const Myposts = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if user is not authenticated
    } else {
      axios
        .get("http://localhost:5000/api/user/posts", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setPosts(response.data); // Set the posts in state
          setLoading(false);
        })
        .catch((error) => {
          setError("Failed to fetch posts");
          setLoading(false);
        });
    }
  }, [navigate]);

  const handleDeletePost = (postId) => {
    // Update state to remove the deleted post from the list
    setPosts(posts.filter((post) => post._id !== postId));
  };

  const handleUpdate = (updatedPost) => {
    setPosts(
      posts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="my-posts-container">
      <nav className="navbar2">
        <div className="navbar-container2">
          <h2 className="navbar-title2" onClick={() => navigate("/")}>
            My posts
          </h2>
          <div className="navbar-links3">
            <button onClick={() => navigate("/")}>Back</button>
          </div>
        </div>
      </nav>
      
      <div className="my-posts-list">
        {posts.map((post) => (
          <MypostCard
            key={post._id}
            post={post}
            onDelete={handleDeletePost}
            onEdit={() => setEditingPost(post)}
          />
        ))}
      </div>
      {editingPost && (
        <EditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default Myposts;
