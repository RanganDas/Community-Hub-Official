import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Mycircle.css";
import { useNavigate } from "react-router-dom";

const Mycircle = () => {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const URL = "https://sparklify-official.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchCircleData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${URL}/api/mycircle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowing(response.data.following);
      setFollowers(response.data.followers);
    } catch (error) {
      console.error("Error fetching circle data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircleData();
  }, []);

  const handleUserClick = (userId) => {
    console.log(`Navigating to profile of user with ID: ${userId}`);
    // Navigate to the user's profile page (implement routing logic here)
  };

  if (loading) {
    return <div className="mycircle-loading">Loading your circle...</div>;
  }

  return (
    <div className="mycircle-main-container">
      <h2 className="mycircle-heading">My Circle</h2>

      <div className="mycircle-list-container">
        {/* Following Section */}
        <div className="mycircle-following">
          <h3 className="mycircle-subheading">Supporting</h3>
          {following.length > 0 ? (
            <div className="mycircle-user-list">
              {following.map((user) => (
                <div key={user._id} className="mycircle-user-container">
                  <img
                    src={user.imageUrl || "./empty.png"} // Use the imageUrl from the backend
                    alt={user.username}
                    className="mycircle-avatar"
                  />
                  <div className="mycircle-user-details">
                    <h4 className="mycircle-username">{user.username}</h4>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mycircle-empty">You are not supporting anyone yet.</p>
          )}
        </div>

        {/* Followers Section */}
        <div className="mycircle-followers">
          <h3 className="mycircle-subheading">Supporters</h3>
          {followers.length > 0 ? (
            <div className="mycircle-user-list">
              {followers.map((user) => (
                <div key={user._id} className="mycircle-user-container">
                  <img
                    src={user.imageUrl || "./empty.png"} // Use the imageUrl from the backend
                    alt={user.username}
                    className="mycircle-avatar"
                  />
                  <div className="mycircle-user-details">
                    <h4 className="mycircle-username">{user.username}</h4>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mycircle-empty">No one is supporting you yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mycircle;
