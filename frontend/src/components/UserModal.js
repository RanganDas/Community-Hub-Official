import React, { useEffect, useState } from "react";
import "./UserModal.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faSuitcase,
  faPhone,
  faLocationDot,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
const UserModal = ({ userInfo, onClose, currentUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const URL = "https://sparklify-official.onrender.com";
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${URL}/user/${userInfo?._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update follow state from the backend
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (userInfo) {
      fetchUserDetails();
    }
  }, [userInfo]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${URL}/follow/${userInfo?._id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(true); // Update state to reflect follow action
    } catch (error) {
      // Check if the error is specifically a 400 error (follow yourself)
      if (error.response && error.response.status === 400) {
        toast.error("Oops! You cannot support yourself");
      }
    }
  };

  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${URL}/unfollow/${userInfo?._id}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFollowing(false); // Update state
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{userInfo?.username || "Unknown User"}</h2>
        <div className="profile-picture-container">
          <img
            src={userInfo?.imageUrl || "./empty.png"}
            alt="Profile"
            className="profile-picture"
          />
        </div>
        <div className="follow-stats">
          <div className="followers">
            <strong className="follower-count">
              {userInfo?.followers?.length || 0}
            </strong>
            <p style={{ margin: "auto" }}>Supporters</p>
          </div>
          <div className="following">
            <strong className="follower-count">
              {userInfo?.following?.length || 0}
            </strong>
            <p style={{ margin: "auto" }}>Supporting</p>
          </div>
        </div>
        
        <p className="user-bio-section-p" style={{ textAlign: "center", color:"gray" }}>
          {userInfo?.bio || "No bio available."}
        </p>

        <div className="user-details-section">
          <div className="user-detail-section-div">
            <FontAwesomeIcon icon={faSuitcase} size="lg" color="gray" />
            <p>{userInfo?.job || "Not provided"}</p>
          </div>
          <div className="user-detail-section-div">
            <FontAwesomeIcon icon={faLocationDot} size="xl" color="gray" />
            <p>{userInfo?.city || "Not provided"}</p>
          </div>
          <div className="user-detail-section-div">
            <FontAwesomeIcon icon={faPhone} size="lg" color="gray" />
            <p>{userInfo?.phoneNumber || "Not provided"}</p>
          </div>
        </div>

        <div className="support-container">
          {isFollowing ? (
            <>
              <button
                className="modal-action unfollow"
                onClick={handleUnfollow}
              >
                Unsupport
              </button>
            </>
          ) : (
            <button className="modal-action follow" onClick={handleFollow}>
              Support
            </button>
          )}
          <button className="modal-close" onClick={onClose}>
            Close
          </button>
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

export default UserModal;
