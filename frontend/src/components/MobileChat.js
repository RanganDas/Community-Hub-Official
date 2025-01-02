import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chatroom.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faSmile,
  faPaperPlane,
  faArrowLeft,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "emoji-picker-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import "./MobileChat.css";
const MobileChat = () => {
  const [userId, setUserId] = useState(null);
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isChatBoxVisible, setIsChatBoxVisible] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleMouseEnter2 = () => setIsHovered2(true);
  const handleMouseLeave2 = () => setIsHovered2(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const URL = "https://community-hub-official.onrender.com";

  useEffect(() => {
    const newSocket = io(`${URL}`);
    setSocket(newSocket);

    newSocket.emit("join", userId);

    // Handle user status updates
    newSocket.on("userStatusUpdate", (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });
    return () => {
      newSocket.disconnect();
    };
  }, [userId, URL]);

  const fetchUserId = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserId(response.data.userId);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  const fetchFollowers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${URL}/api/mycircle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMutualFollowers(response.data.mutualfollowers);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchMessages = async (friendId) => {
    const token = localStorage.getItem("token");
    const chatId = [userId, friendId].sort().join("_");
    try {
      const response = await axios.get(`${URL}/api/chats`, {
        params: { userId, friendId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handleChatSelection = (followerId) => {
    setActiveChat(followerId);
    fetchMessages(followerId);
    setIsChatBoxVisible(true); // Show chat box
  };

  const handleSendMessage = () => {
    if (message.trim() && activeChat && socket) {
      const newMessage = {
        senderId: userId,
        receiverId: activeChat,
        text: message,
      };
      socket.emit("sendMessage", newMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...newMessage, createdAt: new Date() },
      ]);
      setMessage("");
    }
  };

  const handleBackToList = () => {
    setIsChatBoxVisible(false); // Go back to chat list
    setActiveChat(null);
  };

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }
  }, [socket]);

  useEffect(() => {
    fetchUserId();
    fetchFollowers();
  }, []);
  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setIsEmojiPickerOpen(false);
  };
  return (
    <div className="chatroom-wrapper">
      <div className="chatroom">
        {!activeChat ? (
          // Show the sidebar (list) only when no chat is active
          <div className="sidebar">
            <div className="sidebar-header">
              <h3
                style={{
                  color: "white",
                }}
              >
                Community Hub
              </h3>
              <div className="sidebar-header-buttons">
                <button
                  className="info-button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "gray",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  onClick={() => setShowInfoModal(true)}
                >
                  <FontAwesomeIcon icon={faInfoCircle} size="xl" />
                </button>
                <button
                  className="back-button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "gray",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/")}
                >
                  Back
                </button>
              </div>
            </div>

            {showInfoModal && (
              <div className="info-modal">
                <div className="info-modal-content">
                  <p>Support each other to start chatting</p>
                  <button
                    className="close-modal-button"
                    onClick={() => setShowInfoModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <ul>
              {mutualFollowers.map((mutualFollower) => (
                <li
                  style={{
                    color: "white",
                    backgroundColor: "black",
                    margin: "10px",
                    border: "2px solid #363636",
                    borderRadius: "10px",
                    padding: "10px",
                    display: "flex", // Flexbox to align elements
                    alignItems: "center",
                    justifyContent: "space-between", // Space between username and status
                  }}
                  key={mutualFollower._id}
                  onClick={() => handleChatSelection(mutualFollower._id)}
                  className={
                    activeChat === mutualFollower._id ? "active-chat" : ""
                  }
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={mutualFollower.imageUrl || "./empty.png"}
                      alt={mutualFollower.username}
                      className="user-avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    <span className="username">{mutualFollower.username}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "8px",
                      marginRight: "15px",

                      color: onlineUsers.includes(mutualFollower._id)
                        ? "green"
                        : "red",
                    }}
                  >
                    {onlineUsers.includes(mutualFollower._id)
                      ? "🟢"
                      : "🔴"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          // Show the main chat area when a chat is active
          <div className="chat-main">
            <div className="chat-header">
              <div className="header-user-info">
                <img
                  className="header-avatar"
                  src={
                    mutualFollowers.find((f) => f._id === activeChat)
                      ?.imageUrl || "./empty.png"
                  }
                  alt="User Avatar"
                />
                <span className="header-username">
                  {mutualFollowers.find((f) => f._id === activeChat)?.username}
                </span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  marginLeft: "10px",
                  background: "black",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  color: onlineUsers.includes(activeChat) ? "green" : "rgb(130, 0, 0)",
                }}
              >
                {onlineUsers.includes(activeChat) ? "Online" : "Offline"}
              </span>
              <button
                className="back-button"
                onClick={() => setActiveChat(null)}
              >
                Back
              </button>
            </div>

            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.senderId === userId
                      ? "sent-message"
                      : "received-message"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span style={{ margin: "5px" }}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Message Input Section */}
            <div className="message-input">
              <button
                className="emoji-button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              >
                <FontAwesomeIcon
                  icon={faSmile}
                  size="lg"
                  className="emoji-icon"
                />
              </button>
              {isEmojiPickerOpen && (
                <div className="emoji-picker">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme="dark"
                    height={400}
                    width={300}
                    emojiStyle="apple"
                    searchDisabled
                    skinTonesDisabled
                  />
                </div>
              )}

              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-input-field"
              />
              <button className="send-button" onClick={handleSendMessage}>
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  size="xl"
                  className="send-icon"
                />
              </button>
            </div>
          </div>
        )}
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

export default MobileChat;
