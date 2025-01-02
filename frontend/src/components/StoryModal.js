import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StoryModal = ({ onClose, onStoryAdded }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [showImageInput, setShowImageInput] = useState(false); // Controls visibility of image URL input field

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // Get token for authentication
      const payload = { caption };

      // Only include imageUrl if it's not empty
      if (imageUrl) {
        payload.imageUrl = imageUrl;
      }

      const response = await axios.post(
        "http://localhost:5000/api/stories",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Story added successfully!");
      onStoryAdded(response.data.story);
      setImageUrl("");
      setCaption("");
      setShowImageInput(false); // Reset the visibility after submission
    } catch (error) {
      console.error("Error adding story:", error);
      toast.error("Failed to add story. Please try again.");
    }
  };

  return (
    <div className="story-modal">
      <div className="modal-content">
        <button className="close-button"  style={{ color: "white", margin: "0 0 0 0", borderRadius: "50%" }} onClick={onClose}>
          ×
        </button>
        <h2>New Story</h2>
        <form onSubmit={handleSubmit}>
          {/* Image Display */}
          {imageUrl && (
            <div style={{ marginBottom: "15px", textAlign: "center" }}>
              <img
                src={imageUrl}
                alt="Story"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
              />
            </div>
          )}

          {/* Caption Input */}
          <textarea
            placeholder="Write"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{ color: "white", backgroundColor: "#333", border: "none" }}
          ></textarea>

          {/* Plus Button to show the image URL input field */}
          {!showImageInput && (
            <button
              type="button"
              onClick={() => setShowImageInput(true)} // Show the image URL input field when clicked
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "transparent",
                border: "1px solid white",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
                marginBottom: "20px",
                borderRadius: "50%",
              }}
            >
              +
            </button>
          )}

          {/* Image URL Input */}
          {showImageInput && (
            <div>
              <input
                type="text"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{
                  color: "white",
                  backgroundColor: "#333",
                  border: "none",
                  marginTop: "10px",
                  marginBottom: "20px",
                  width: "350px",
                }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="submit-button">
            Add Story
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default StoryModal;
