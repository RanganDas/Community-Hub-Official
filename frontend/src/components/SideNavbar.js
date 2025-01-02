import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./sideNavbar.css";

const SideNavbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const [username, setUsername] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // State for imageUrl
  const [loading, setLoading] = useState(true); // Loading state for API call

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserImage(); // Fetch user image if logged in
    }
  }, [isLoggedIn]);

  const fetchUserImage = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      const response = await axios.get("http://localhost:5000/api/user/image", {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the headers
        },
      });
      setUsername(response.data.username);
      setImageUrl(response.data.imageUrl); // Set the fetched imageUrl
      setLoading(false); // Set loading to false after fetching data
    } catch (error) {
      console.error("Error fetching user image:", error);
      setLoading(false); // Handle loading state in case of error
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    sessionStorage.clear(); // Clear all session data
    navigate("/");
    window.location.reload(); // Redirect to home page
  };

  const handleSignup = () => {
    navigate("/register"); // Redirect to the signup page
  };
  const handleLogin = () => {
    navigate("/login"); // Redirect to the signup page
  };

  return (
    <div className="right-sidebar">
      <div className="sidebar-title">Menu</div>
      <ul className="nav">
        {!isLoggedIn ? (
          <ul style={{ listStyleType: "none" }}>
            <li>
              <p className="sidebar-p1">
                Create an account to unlock features like posting, chatting and
                enjoy many more exclusive functionalities.
              </p>
              <button className="profile-buttons" onClick={handleSignup}>
                Sign Up
              </button>
            </li>
            <p style={{ marginLeft: "100px" }}>or</p>
            <li>
              <p className="sidebar-p2">Already have an account ?</p>
              <button className="profile-buttons" onClick={handleLogin}>
                Log In
              </button>
            </li>
          </ul>
        ) : (
          <ul className="logged-in-menu">
            <li className="profile-image-container">
              {!loading ? (
                <img
                  src={imageUrl || "./empty.png"} // Use user image or placeholder
                  alt={"Error"}
                  className="profile-image"
                  //style={{ marginRight: "50px" }}
                />
              ) : (
                <p>Loading...</p>
              )}
            </li>
            <li className="profile-username">{username}</li>
            <li>
              <button
                className="profile-buttons"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
            </li>
            <li>
              <button
                className="profile-buttons"
                onClick={() => navigate("/myposts")}
              >
                My posts
              </button>
            </li>
            <li>
              <button
                className="profile-buttons"
                onClick={() => navigate("/favourites")}
              >
                Favourites
              </button>
            </li>
            <li>
              <button
                className="profile-buttons"
                onClick={() => navigate("/activity")}
              >
                My activity
              </button>
            </li>
            <li>
              <button
                className="profile-buttons"
                onClick={() => navigate("/circle")}
              >
                My circle
              </button>
            </li>
            <li>
              <button className="profile-buttons" onClick={handleLogout}>
                Log Out
              </button>
            </li>
          </ul>
        )}
        <li>
          <a
            style={{
              display: "flex",
              justifyContent: "center",
              width: "210px",
              alignItems: "center",
              textAlign: "center",
              fontSize: "13px",
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "gray",
              textDecoration: "underline",
            }}
            href="/aboutus"
          >
            About us
          </a>
        </li>
      </ul>
    </div>
  );
};

export default SideNavbar;
