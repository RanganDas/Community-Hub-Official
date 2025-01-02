import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserDetailsModal.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  
  faSuitcase,
  faPhone,
  faLocationDot,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
const UserDetailsModal = ({ userInfo, userId, onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/people/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { userDetails, isFollowing } = response.data;

        setUserDetails(userDetails); // Update state with userDetails
        setIsFollowing(isFollowing); // Update state with isFollowing
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Error fetching user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/follow/${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(true); // Update state
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("Oops! You cannot support yourself");
      }
    }
  };

  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/unfollow/${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(false); // Update state
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (loading) {
    return <div className="user-details-modal-loading">Loading...</div>;
  }

  if (error) {
    return <div className="user-details-modal-error">{error}</div>;
  }

  return (
    <div className="user-details-modal-overlay">
      <div className="user-details-modal">
        <button className="user-details-modal-close" onClick={onClose}>
          ×
        </button>

        {/* Profile Image with Border */}
        <div className="user-details-image-container">
          <img
            src={userDetails.profilePicture}
            alt={userDetails.username}
            className="user-details-modal-image"
          />
        </div>
        <h2>{userDetails.username}</h2>

        <div className="user-details-info">
          {/* Following and Followers */}
          <div className="user-details-stats">
            <div className="user-details-stat-box">
              <p className="stat-count">{userDetails.followers}</p>
              <p className="stat-label">Supporters</p>
            </div>
            <div className="user-details-stat-box">
              <p className="stat-count">{userDetails.following}</p>
              <p className="stat-label">Supporting</p>
            </div>
          </div>

          {/* User Details */}
          <div className="user-details-ps">
            <p>
              <span className="span-text" style={{ wordWrap: "break-word", marginBottom: "10px",textAlign: "center" }}>
                {userDetails.bio}
              </span>
            </p>
            <p>
              <FontAwesomeIcon icon={faCalendarDays} className="icon" />
              <span className="span-text">{userDetails.age}</span>
            </p>
            <p>
              <FontAwesomeIcon icon={faSuitcase} className="icon" />
              <span className="span-text">{userDetails.job}</span>
            </p>
            <p>
              <FontAwesomeIcon icon={faLocationDot} className="icon" />
              <span className="span-text">{userDetails.city}</span>
            </p>
            <p>
              <FontAwesomeIcon icon={faPhone} className="icon" />
              <span className="span-text">{userDetails.phoneNumber}</span>
            </p>
          </div>

          {/* Follow Button */}
          {isFollowing ? (
            <>
              <button
                className="modal-details-action unfollow"
                onClick={handleUnfollow}
              >
                Unsupport
              </button>
            </>
          ) : (
            <button
              className="modal-details-action follow"
              onClick={handleFollow}
            >
              Support
            </button>
          )}
        </div>
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        zIndex={9999}
      />
    </div>
  );
};

export default UserDetailsModal;
