import React, { useState } from "react";
import axios from "axios";
import "./PostModal.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const PostModal = ({ isOpen, onClose, onPostCreated }) => {
  const URL = "https://sparklify-official.onrender.com";
  const OPENCAGE_API_KEY = "f04de10f2b304f1d956f4b0bd8c96ecb"; // Replace with your API key

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    hashtags: "",
    location: "",
    imageUrl: "",
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "location") {
      fetchLocationSuggestions(value);
    }
  };

  const fetchLocationSuggestions = async (query) => {
    // Check if the query is valid (at least 3 characters)
    if (!query || query.trim().length < 3) {
      setLocationSuggestions([]); // Clear suggestions if query is invalid
      return;
    }
  
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
         {
          params: {
            key: OPENCAGE_API_KEY,
            q: query.trim(), // Trim whitespace for clean query
            limit: 3, // Limit results to 5 suggestions
          },
        }
      );
  
      const suggestions = response.data.results.map((result) => ({
        formatted: result.formatted,
        geometry: result.geometry,
      }));
  
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };
  

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, location: location.formatted });
    setSelectedLocation(location);
    setLocationSuggestions([]); // Clear suggestions
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!selectedLocation) {
      toast.error("Please select a valid location from the suggestions.");
      return;
    }

    // Prepare post data
    const postData = {
      ...formData,
      hashtags: formData.hashtags.split(",").map((tag) => tag.trim()), // Convert hashtags to an array
    };

    try {
      const response = await axios.post(`${URL}/api/posts/createpost`, postData, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
            required
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
            required
          ></textarea>
          <input
            type="text"
            name="hashtags"
            placeholder="#hashtags (comma-separated)"
            value={formData.hashtags}
            onChange={handleChange}
            className="unique-input-field"
            autoComplete="off"
            maxLength={100}
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
          {locationSuggestions.length > 0 && (
            <ul className="location-suggestions">
              {locationSuggestions.map((location, index) => (
                <li
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="location-suggestion-item"
                >
                  {location.formatted}
                </li>
              ))}
            </ul>
          )}
          <button type="submit" className="unique-submit-button">
            Post
          </button>
        </form>
        <button className="unique-close-button" onClick={onClose}>
          Close
        </button>
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

export default PostModal;
