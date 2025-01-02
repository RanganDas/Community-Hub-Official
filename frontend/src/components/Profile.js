import React, { useEffect, useState } from "react";
import axios from "axios"; // To make API calls
import { useNavigate } from "react-router-dom";
import "./Profile.css"; // Make sure the CSS is linked

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faSuitcase,
  faPhone,
  faLocationDot,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [imageUrl, setImageUrl] = useState(""); // State for imageUrl
  const [loading, setLoading] = useState(true); // Loading state for API call

  const fetchUserImage = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      const response = await axios.get("http://localhost:5000/api/user/image", {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the headers
        },
      });

      setImageUrl(response.data.imageUrl); // Set the fetched imageUrl
      setLoading(false); // Set loading to false after fetching data
    } catch (error) {
      console.error("Error fetching user image:", error);
      setLoading(false); // Handle loading state in case of error
    }
  };
  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login if user is not authenticated
    } else {
      axios
        .get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserData(response.data);
          fetchUserImage();
        })
        .catch((err) => {
          console.error("Error fetching user data: ", err);
        });
    }
  }, [token, navigate]);

  const handleUpdate = () => {
    navigate("/updateprofile"); // This route will handle the profile update form
  };

  if (!userData) return <div>Loading...</div>; // Display loading while fetching data

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">{userData.username}</h2>

        {/* Profile Picture */}
        <div className="profile-picture-container">
          {!loading ? (
            <img
              src={imageUrl || "./empty.png"} // Use user image or placeholder
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div className="profile-follow-container">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="profile-follow">
              <h4>Supporting</h4>
              <p>{userData.following || 0}</p>
            </div>
            <div className="profile-follow">
              <h4>Supporters</h4>
              <p>{userData.followers || 0}</p>
            </div>
          </div>
        </div>

        <div className="profile-box-container">
          {/* Box 1: Username and Bio */}
          <div className="profile-box box-1">
            <p style={{ textAlign: "center" }}>
              {userData.bio || "No bio available"}
            </p>
          </div>

          {/* Box 2: Email, Phone, Date of Birth */}
          <div className="profile-box box-2">
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
              <h3>
                <FontAwesomeIcon icon={faEnvelope} size="lg" color="gray" />
              </h3>
              <p>{userData.email}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
              <h4>
                <FontAwesomeIcon icon={faPhone} size="lg" color="gray" />
              </h4>
              <p>{userData.phoneNumber || "Add info"}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
              <h4>
                <FontAwesomeIcon icon={faCalendarDays} size="lg" color="gray" />
              </h4>
              <p>
                {userData.dateOfBirth
                  ? userData.dateOfBirth.split("T")[0]
                  : "Add info"}
              </p>
            </div>
          </div>

          {/* Box 3: Job Details */}
          <div className="profile-box box-3">
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
            <h3>
              <FontAwesomeIcon icon={faSuitcase} size="lg" color="gray" />
            </h3>
            <p>{userData.job || "Add info"}</p></div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
            <h3>
              <FontAwesomeIcon icon={faLocationDot} size="lg" color="gray" />
            </h3>
            <p>{userData.city}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
            <h4>
              <FontAwesomeIcon icon={faCalendarDays} size="lg" color="gray" />
            </h4>
            <p>{userData.age || "Add info"}</p>
            </div>
          </div>
        </div>

        {/* Button to Update Information */}
        <div className="button-container">
          <button className="update-button" onClick={handleUpdate}>
            Update Information
          </button>
          <button className="back-button-10" onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
