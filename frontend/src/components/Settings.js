import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Settings.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Graph from "./Graph";
const Settings = () => {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalFavorites: 0,
    totalFollowing: 0,
    totalFollowers: 0,
  });
  const [deleteInputVisible, setDeleteInputVisible] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const navigate = useNavigate();
  const URL = "https://sparklify-official.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${URL}/api/user/settings-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const {
          username,
          totalLikes,
          totalFavorites,
          totalFollowing,
          totalFollowers,
        } = response.data;
        setUsername(username);
        setStats({
          totalLikes,
          totalFavorites,
          totalFollowing,
          totalFollowers,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data.");
      }
    };

    fetchProfileData();
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteInput === `delete/myaccount/${username}`) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${URL}/api/user/delete`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.removeItem("token");
        navigate("/login");
        window.location.reload();
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account. Please try again.");
      }
    } else {
      toast.error(
        "Invalid input. Please type the confirmation string correctly."
      );
    }
  };

  return (
    <div className="settings-page">
      <nav className="navbar3">
        <div className="navbar-container3">
          <h2 className="navbar-title3" onClick={() => navigate("/")}>
            Settings
          </h2>
          <div className="navbar-links3">
            <button onClick={() => navigate("/")}>Back</button>
          </div>
        </div>
      </nav>

      {/* Account Status Section */}
      <div className="settings-section">
        <h3 className="settings-subtitle">Account Status</h3>
        <div className="account-stats-wrapper">
          <p className="account-stats-item">
            Username: <strong>{username}</strong>
          </p>
          <div className="account-stats-grid">
            <div
              className="account-stats-box"
              onClick={() => navigate("/activity")}
            >
              <p className="stats-label">Likes</p>
              <p className="stats-value">{stats.totalLikes}</p>
            </div>
            <div
              className="account-stats-box"
              onClick={() => navigate("/favourites")}
            >
              <p className="stats-label">Favorites</p>
              <p className="stats-value">{stats.totalFavorites}</p>
            </div>
            <div
              className="account-stats-box"
              onClick={() => navigate("/circle")}
            >
              <p className="stats-label">Supporting</p>
              <p className="stats-value">{stats.totalFollowing}</p>
            </div>
            <div
              className="account-stats-box"
              onClick={() => navigate("/circle")}
            >
              <p className="stats-label">Supporters</p>
              <p className="stats-value">{stats.totalFollowers}</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <Graph stats={stats} />
      </div>

      {/* Restricted Zone Section */}
      <div className="settings-section">
        <h3 className="settings-subtitle">Restricted Zone</h3>
        <p style={{ textAlign: "center" }}>Delete your account</p>
        <button
          className="delete-account-button"
          style={{
            backgroundColor: deleteInputVisible
              ? "rgba(128, 128, 128, 0.282)"
              : "#e6000016",
            border: `1px solid ${deleteInputVisible ? "gray" : "#510c0c"}`,
            width: "150px",
          }}
          onClick={() => setDeleteInputVisible((prev) => !prev)}
        >
          {deleteInputVisible ? "Hide" : "Delete Account"}
        </button>

        <div
          className={`delete-confirmation ${
            deleteInputVisible ? "visible" : ""
          }`}
        >
          {deleteInputVisible && (
            <>
              <p className="delete-confirmation-p">
                Note: After deleting your account, all of your data including
                posts, likes, chats and other information will be permanently
                deleted and cannot be recovered.
              </p>
              <label style={{ textAlign: "center" }}>
                Type <strong>{`delete/myaccount/${username}`}</strong> to delete
                your account:
              </label>
              <input
                type="text"
                className="settings-delete-input"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type here"
              />
              <button
                className="confirm-delete-button"
                style={{ border: "1px solid #510c0c" }}
                onClick={handleDeleteAccount}
              >
                Confirm Delete
              </button>
            </>
          )}
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

export default Settings;
