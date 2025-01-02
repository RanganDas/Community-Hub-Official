import React from "react";
import axios from "axios";
//import { useNavigate } from 'react-router-dom';
import "./MypostCard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const MypostCard = ({ post, onDelete, onEdit }) => {
  //const navigate = useNavigate();

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Post deleted successfully");

      // Call the parent component's function to remove the deleted post from the state
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      toast.error("Post deletion failed");
    }
  };
  const postDate = new Date(post.createdAt).toLocaleString();
  return (
    <div className="post-card-wrapper2">
      <div className="post-card2">
        <div className="post-header">
          <p className="post-username">Posted by: You</p>
          <p className="post-date">{postDate}</p>
        </div>
        <div className="mypost-card2">
          {post.imageUrl && (
            <div className="post-image-container">
              <img src={post.imageUrl} alt="Post" className="post-image" />
            </div>
          )}
          <div className="post-info">
            <h3 style={{ marginTop: "20px" }}>{post.title}</h3>
            <p style={{ marginTop: "20px" }}>{post.content}</p>
            <p style={{ display: "flex", alignItems: "center", marginTop:"20px" }}>
              <FontAwesomeIcon
                size="lg"
                icon={faHeart}
                color="#df67bf"
                style={{ marginRight: "8px" }}
              />{" "}
              {post.likes}
            </p>

            <div className="post-actions">
              <button className="action-btn edit-btn" onClick={onEdit}>
                Edit
              </button>
              <button className="action-btn delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
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

export default MypostCard;
