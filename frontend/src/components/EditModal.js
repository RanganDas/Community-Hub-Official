// EditModal.js

import React, { useState } from 'react';
import axios from 'axios';
import './EditModal.css';
const EditModal = ({ post, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    hashtags: post.hashtags.join(", "),
    location: post.location,
    imageUrl: post.imageUrl,
  });
  const URL = "https://sparklify-official.onrender.com";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${URL}/api/posts/${post._id}`,
        { ...formData, hashtags: formData.hashtags.split(", ") },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdate(response.data); // Pass updated post to parent
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  return (
    <div className="edit-modal">
      <div className="edit-modal-content">
        <h2 className="edit-modal-title">Edit Post</h2>
        {/* Image Preview */}
        {formData.imageUrl && (
          <div className="edit-modal-image-preview">
            <img src={formData.imageUrl} alt="Preview" className="edit-modal-image" />
          </div>
        )}
        {/* Input Fields */}
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="edit-modal-input"
          maxLength={50}
        />
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Content"
          className="edit-modal-textarea"
          maxLength={300}
        />
        <input
          type="text"
          name="hashtags"
          value={formData.hashtags}
          onChange={handleChange}
          placeholder="Hashtags"
          className="edit-modal-input"
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="edit-modal-input"
        />
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          className="edit-modal-input"
        />
        {/* Buttons */}
        <div className="edit-modal-buttons">
          <button onClick={handleUpdate} className="edit-modal-button update">
            Update
          </button>
          <button onClick={onClose} className="edit-modal-button cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default EditModal;
