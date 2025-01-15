import React, { useState, useEffect } from "react";
import axios from "axios";
import StoryModal from "./StoryModal";
import "./StoryFeed.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
const StoryFeed = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [groupedStories, setGroupedStories] = useState([]);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userId, setUserId] = useState(null); // For logged-in user's ID
  const URL = "https://sparklify-official.onrender.com";
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchFollowingStories = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${URL}/api/stories/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Decode token to get the logged-in user's ID
        const { id } = JSON.parse(atob(token.split(".")[1]));
        setUserId(id);

        // Separate the logged-in user's stories from others
        const myStories = data.groupedStories.filter(
          (group) => group.user._id === id
        );
        const otherStories = data.groupedStories.filter(
          (group) => group.user._id !== id
        );

        // Combine with my stories at the top
        setGroupedStories([...myStories, ...otherStories]);
      } catch (error) {
        console.error("Error fetching following stories:", error);
      }
    };

    fetchFollowingStories();
  }, []);

  const handleStoryAdded = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${URL}/api/stories/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { id } = JSON.parse(atob(token.split(".")[1]));
      setUserId(id);

      const myStories = data.groupedStories.filter(
        (group) => group.user._id === id
      );
      const otherStories = data.groupedStories.filter(
        (group) => group.user._id !== id
      );

      setGroupedStories([...myStories, ...otherStories]);
    } catch (error) {
      console.error("Error refreshing stories:", error);
    }

    setShowModal(false); // Close the modal after adding the story
  };

  const handleCardClick = (userStories) => {
    setSelectedUserStories(userStories);
    setCurrentStoryIndex(0);
  };

  const closeStoryModal = () => {
    setSelectedUserStories(null);
    setCurrentStoryIndex(0);
  };

  const goToNextStory = () => {
    if (currentStoryIndex < selectedUserStories.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  const handleDeleteStory = async () => {
    const storyId = selectedUserStories.stories[currentStoryIndex]._id;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${URL}/api/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedStories = selectedUserStories.stories.filter(
        (story) => story._id !== storyId
      );

      if (updatedStories.length === 0) {
        setGroupedStories((prev) =>
          prev.filter(
            (group) => group.user._id !== selectedUserStories.user._id
          )
        );
        closeStoryModal();
      } else {
        setSelectedUserStories((prev) => ({
          ...prev,
          stories: updatedStories,
        }));
        setCurrentStoryIndex((prev) =>
          prev >= updatedStories.length ? prev - 1 : prev
        );
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story. Please try again.");
    }
  };
  // Helper function to format timestamps
  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const storyDate = new Date(timestamp);

    // Check if the story is today or yesterday
    const isToday =
      now.getDate() === storyDate.getDate() &&
      now.getMonth() === storyDate.getMonth() &&
      now.getFullYear() === storyDate.getFullYear();

    const isYesterday =
      now.getDate() - 1 === storyDate.getDate() &&
      now.getMonth() === storyDate.getMonth() &&
      now.getFullYear() === storyDate.getFullYear();

    if (isToday) {
      return "Today";
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return storyDate.toLocaleDateString();
    }
  };
  return (
    <div className="story-page">
      <div className="story-feed-container">
        <div className="story-feed">
          <button
            title="Add Story"
            onClick={() => setShowModal(true)}
            className="add-story-button"
          >
            +
          </button>
          {showModal && (
            <StoryModal
              onClose={() => setShowModal(false)}
              onStoryAdded={handleStoryAdded}
            />
          )}

          {groupedStories.length === 0 ? (
            // Display this message when no stories are available
            <div className="no-stories-message" style={{ textAlign: "center", backgroundColor: "#1e1e1e",borderRadius:"10px", padding:"10px" }}>
              <p>No one posted a story yet</p>
            </div>
          ) : (
            groupedStories.map((group) => (
              <div
                key={group.user._id}
                className="story-card-container"
                onClick={() => handleCardClick(group)}
              >
                <div className="story-card">
                  <img
                    src={group.stories[0].imageUrl}
                    alt="Story"
                    className="story-image"
                  />
                </div>
                <p className="story-caption">{group.user.username}</p>
                <p className="story-timestamp">
                  {formatTimestamp(group.stories[0].createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedUserStories && (
        <div className="story-content-modal">
          <div className="modal-content">
            <button className="close-button" onClick={closeStoryModal}>
              ×
            </button>
            <img
              src={selectedUserStories.stories[currentStoryIndex].imageUrl}
              alt="Story"
              className="modal-story-image"
            />
            <p className="modal-story-caption">
              {selectedUserStories.stories[currentStoryIndex].caption}
            </p>
            <div className="modal-navigation">
              <button
                onClick={goToPreviousStory}
                disabled={currentStoryIndex === 0}
              >
                ←
              </button>
              <button
                onClick={goToNextStory}
                disabled={
                  currentStoryIndex === selectedUserStories.stories.length - 1
                }
              >
                →
              </button>
              {selectedUserStories.user._id === userId && (
                <button className="delete-button" onClick={handleDeleteStory}>
                  <FontAwesomeIcon size="lg" icon={faTrash} />
                </button>
              )}
            </div>
          </div>
        </div>
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

export default StoryFeed;
