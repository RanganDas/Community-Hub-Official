import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notification.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("https://community-hub-official.onrender.com");

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://community-hub-official.onrender.com/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    socket.on("newNotification", (notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://community-hub-official.onrender.com/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("https://community-hub-official.onrender.com/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Clear notifications from local state
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };
  
  

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div >
      <nav className="navbar3">
        <div className="navbar-container3">
          <h2 className="navbar-title3" onClick={() => navigate("/")}>
            Notifications
          </h2>
          <div className="navbar-links3">
            <button onClick={deleteAllNotifications}>Delete all</button>
            <button onClick={() => navigate("/")}>Back</button>
          </div>
        </div>
      </nav>

      <div className="notifications-container">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div className="notification-card" key={notification._id}>
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="timestamp">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                className="delete-button"
                onClick={() => deleteNotification(notification._id)}
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  size="xl"
                  style={{
                    color: hoveredId === notification._id ? "red" : "gray",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredId(notification._id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No new notifications</p>
        )}
      </div>
    </div>
  );
};

export default Notification;
