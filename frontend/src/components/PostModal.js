import React, { useState } from "react";
import axios from "axios";
import "./PostModal.css";

const PostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    hashtags: "",
    location: "",
    imageUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Prepare post data
    const postData = {
      ...formData,
      hashtags: formData.hashtags.split(",").map((tag) => tag.trim()), // Convert hashtags to an array
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/posts/createpost",
        postData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (onPostCreated) {
        onPostCreated(response.data); // Call callback with created post
      }
      onClose(); // Close modal after posting
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="unique-modal-overlay">
      <div className="unique-modal-content">
        <h2 className="unique-modal-title">New Post</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Post title"
            value={formData.title}
            onChange={handleChange}
            className="unique-input-field"
            autoComplete="off"
            maxLength={50}
          />
          <div className="unique-image-preview-container">
            <img
              src={formData.imageUrl}
              alt="Add photo"
              className="unique-preview-image"
            />
          </div>
          <input
            type="text"
            name="imageUrl"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={handleChange}
            className="unique-input-field"
            autoComplete="off"
          />
          <textarea
            name="content"
            placeholder="Write something..."
            value={formData.content}
            onChange={handleChange}
            className="unique-textarea-field"
            autoComplete="off"
            maxLength={300}
          ></textarea>
          <input
            type="text"
            name="hashtags"
            placeholder="#hashtags (comma-separated)"
            value={formData.hashtags}
            onChange={handleChange}
            className="unique-input-field"
            autoComplete="off"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="unique-input-field"
            autoComplete="off"
          />
          <button type="submit" className="unique-submit-button">Post</button>
        </form>
        <button className="unique-close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
  
  
};

export default PostModal;
