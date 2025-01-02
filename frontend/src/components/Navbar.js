import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faNewspaper,
  faHandshake,
  faHouseChimneyUser,
  faUserGroup,
  faSearch,
  faComments,
  faCirclePlus,
  faBell,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";

import PostModal from "./PostModal";
import "./Navbar.css";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("token"); // Check if user is logged in

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const [notificationCount, setNotificationCount] = useState(0); // Store notification count

  const [hoveredIcon, setHoveredIcon] = useState(null); // Track the hovered icon ID

  // Handle mouse enter and leave for specific icons
  const handleMouseEnter = (icon) => setHoveredIcon(icon);
  const handleMouseLeave = () => setHoveredIcon(null);

  const fetchNotificationCount = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://community-hub-official.onrender.com/api/count/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotificationCount(response.data.notificationCount); // Set notification count
    } catch (error) {
      console.error("Error fetching notification count", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotificationCount(); // Fetch notification count when logged in
    }
  }, [isLoggedIn]);

  return (
    <nav className="navbar">
      

      {/* Navbar Links */}
      <div className={`menu-links ${menuOpen ? "open" : ""}`}>
        <ul>
          {/* Home button */}
          <li>
            <a href="/" style={{ textDecoration: "none" }}>
              <FontAwesomeIcon
                icon={faHouseChimneyUser}
                size="xl"
                style={{
                  color: hoveredIcon === "home" ? "#B197FC" : "#af94ff", // Change color based on hover
                  transition: "color 0.3s ease", // Add smooth transition
                }}
                onMouseEnter={() => handleMouseEnter("home")}
                onMouseLeave={handleMouseLeave}
                title="Home"
              />
            </a>
          </li>
          <li>
            <a href="/news" style={{ textDecoration: "none" }}>
              <FontAwesomeIcon
                icon={faNewspaper}
                size="xl"
                style={{ color: "#af94ff" }}
                title="News"
              />
            </a>
          </li>

          {isLoggedIn ? (
            <>
             <li>
                <a href="/storyfeed" style={{ textDecoration: "none" }}>
                  <FontAwesomeIcon
                    icon={faRocket}
                    size="xl"
                    style={{ color: "#af94ff" }}
                    title="Stories"
                  />
                </a>
              </li>
              <li>
                <button className="icon-button" onClick={toggleModal}>
                  <FontAwesomeIcon
                    icon={faCirclePlus}
                    //style={{ color: "#00d1d1", width: "40px", height: "40px" }}
                    title="New post"
                  />
                </button>
              </li>
              <li>
                <a href="/search" style={{ textDecoration: "none" }}>
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    size="xl"
                    style={{ color: "#af94ff" }}
                    title="Search users"
                  />
                </a>
              </li>
              <li>
                <a href="/chatroom" style={{ textDecoration: "none" }}>
                  <FontAwesomeIcon
                    icon={faComments}
                    size="xl"
                    style={{ color: "#af94ff" }}
                    title="Chatroom"
                  />
                </a>
              </li>
              <li>
                <a href="/notification" style={{ textDecoration: "none" }}>
                  <FontAwesomeIcon
                    icon={faBell}
                    size="xl"
                    style={{ color: "#af94ff" }}
                    title="Notifications"
                  />
                  <span className="notification-count-box">
                    {notificationCount > 0 ? notificationCount : "0"}
                  </span>
                </a>
              </li>
            </>
          ) : null}
        </ul>
      </div>

      {/* Modal */}
      {isLoggedIn && <PostModal isOpen={isModalOpen} onClose={toggleModal} />}

      {/* Hamburger Icon for mobile */}
     
    </nav>
  );
};

export default Navbar;
