import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Friends.css";
//import UserModal from "./UserModal"; // Import the UserModal component
import { useNavigate } from "react-router-dom";
import UserDetailsModal from "./UserDetailsModal"; // Import the new modal

const Friends = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //const [selectedUser, setSelectedUser] = useState(null); // State to manage the selected user

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [randomUser, setRandomUser] = useState(null); // New state for random user

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "https://community-hub-official.onrender.com/api/people/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Fetched Users:", response.data); // Log the fetched users
        setUsers(response.data);

        // Pick a random user from the fetched data
        if (response.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * response.data.length);
          setRandomUser(response.data[randomIndex]);
        }

        setFilteredUsers(response.data);
      } catch (err) {
        console.error(err);
        setError("Error fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const openDetailsModal = (user) => {
    if (user._id) {
      setSelectedUserId(user._id); // Ensure `_id` is used
      setDetailsModalOpen(true);
    } else {
      console.error("User ID is undefined");
    }
  };

  const closeDetailsModal = () => {
    setSelectedUserId(null);
    setDetailsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      {/* Navbar */}
      <div className="navbar10">
        <button className="back-btn" onClick={() => navigate("/")}>
          Back
        </button>
        <h2 className="navbar-title">People</h2>
      </div>
      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>

      {/* User List */}
      <div className="user-list">
        {/* If search query is empty, show the random user */}
        {filteredUsers.length > 0 && !searchQuery ? (
          <div
            key={randomUser._id}
            className="user-card"
            onClick={() => openDetailsModal(randomUser)}
          >
            <img src={randomUser.profilePicture} alt={randomUser.username} />
            <h3>{randomUser.username}</h3>
            <p style={{ wordWrap: "break-word" }}>
              {randomUser.bio.length > 80
                ? `${randomUser.bio.slice(0, 80)}...`
                : randomUser.bio}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="user-card"
              onClick={() => openDetailsModal(user)}
            >
              <img src={user.profilePicture} alt={user.username} />
              <h3>{user.username}</h3>
              <p style={{ wordWrap: "break-word" }}>
                {user.bio.length > 80
                  ? `${user.bio.slice(0, 80)}...`
                  : user.bio}
              </p>
            </div>
          ))
        )}
        {filteredUsers.length === 0 && (
          <div className="no-results">No users found.</div>
        )}
      </div>

      {/* Render the UserDetailsModal if detailsModalOpen is true */}
      {detailsModalOpen && (
        <UserDetailsModal userId={selectedUserId} onClose={closeDetailsModal} />
      )}
    </div>
  );
};

export default Friends;
