import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chatroom.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faSmile,
  faPaperPlane,
  faPhone,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "emoji-picker-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";

const Chatroom = () => {
  const [userId, setUserId] = useState(null);
  const [mutualFollowers, setMutualFollowers] = useState([]); // Updated to plural form
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleMouseEnter2 = () => setIsHovered2(true);
  const handleMouseLeave2 = () => setIsHovered2(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const [isTyping, setIsTyping] = useState(false); // New state for typing indicator
  const [typingUser, setTypingUser] = useState(null); // To track which user is typing


  const URL = "https://community-hub-official.onrender.com";

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

  const fetchFollowers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${URL}/api/mycircle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMutualFollowers(response.data.mutualfollowers); // Corrected to mutualFollowers
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchMessages = async (friendId) => {
    const token = localStorage.getItem("token");
    if (!userId || !friendId) {
      console.error("Missing userId or friendId.");
      return;
    }

    const chatId = [userId, friendId].sort().join("_");
    console.log("Generated chatId:", chatId);

    try {
      const response = await axios.get(`${URL}/api/chats`, {
        params: { userId, friendId },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.length > 0) {
        console.log("Fetched messages:", response.data);
        setMessages(response.data);
      } else {
        console.log("No messages found for this chat.");
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
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
      setIsTyping(false); // Stop typing indicator after message is sent
      socket.emit("stopTyping", { senderId: userId, receiverId: activeChat });
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }
  }, [socket]);

  useEffect(() => {
    const messagesDiv = document.querySelector(".chatroom-messages");
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }, [messages]);

  const handleDeleteChat = async () => {
    if (!activeChat) return;

    const chatId = [userId, activeChat].sort().join("_");
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`"${URL}/api/chats`, {
        data: { chatId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages([]);
      toast.success("Chat deleted successfully!");
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleChatSelection = (followerId) => {
    setActiveChat(followerId);
    fetchMessages(followerId);
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setIsEmojiPickerOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserId();
    fetchFollowers();
  }, []);

  useEffect(() => {
    if (userId && activeChat) {
      fetchMessages(activeChat);
    }
  }, [userId, activeChat]);


  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
  
      socket.on("typing", (userId) => {
        if (userId !== activeChat) return; // Only show typing indicator if it's for the active chat
        setTypingUser(userId); // Set the typing user for the active chat
      });
  
      socket.on("stopTyping", (userId) => {
        if (userId === activeChat) {
          setTypingUser(null); // Stop showing the typing indicator when the user stops typing
        }
      });
    }
  }, [socket, activeChat, userId]);  // Make sure to include the relevant dependencies
  


  

  return (
    <div className="chatroom-container-wrapper">
      <div className="chatroom-container">
        <div className="chatroom-sidebar">
          <h3>Your Supporters</h3>
          <ul>
            {mutualFollowers.map((mutualFollower) => (
              <li
                key={mutualFollower._id}
                onClick={() => handleChatSelection(mutualFollower._id)}
                className={activeChat === mutualFollower._id ? "active" : ""}
              >
                <img
                  src={mutualFollower.imageUrl || "./empty.png"}
                  alt={mutualFollower.username}
                  className="avatar"
                />
                <span>{mutualFollower.username}</span>
                <span
                  style={{
                    fontSize: "10px",
                    marginLeft: "auto",
                    marginRight: "15px",
                  }}
                >
                  {onlineUsers.includes(mutualFollower._id) ? "🟢" : "🔴"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="chatroom-main">
          {activeChat ? (
            <>
              <div style={{ padding: "15px" }} className="chatroom-header">
                <div></div>
                <h3 style={{ display: "flex", alignItems: "center" }}>
                  <img
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                    src={
                      mutualFollowers.find((f) => f._id === activeChat)
                        ?.imageUrl || "./empty.png"
                    }
                    alt="User Avatar"
                  />
                  {mutualFollowers.find((f) => f._id === activeChat)?.username}
                </h3>
                <span
                  style={{
                    fontSize: "14px",
                    marginLeft: "auto",
                    marginRight: "15px",
                    color: onlineUsers.includes(activeChat) ? "green" : "red",
                  }}
                >
                  {onlineUsers.includes(activeChat)
                    ? "Online"
                    : "Offline"}
                </span>
              </div>

              <div className="chatroom-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${
                      msg.senderId === userId ? "sent" : "received"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
                {typingUser && typingUser !== userId && (
                  <div className="typing-indicator">
                    <span>Typing...</span>
                  </div>
                )}
              </div>

              <div className="chatroom-input">
                <button
                  className="emoji-btn"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                >
                  <FontAwesomeIcon
                    icon={faSmile}
                    size="lg"
                    style={{
                      color: isHovered2 ? "lightblue" : "gray",
                      cursor: "pointer",
                    }}
                    onMouseEnter={handleMouseEnter2}
                    onMouseLeave={handleMouseLeave2}
                  />
                </button>
                {isEmojiPickerOpen && (
                  <div className="emoji-picker">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme="dark"
                      height={500}
                      width={400}
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
                />
                <button className="chat-send-btn" onClick={handleSendMessage}>
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    size="xl"
                    style={{ color: "white" }}
                  />
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center" }}>
                Follow each other to start a conversation and enjoy...
              </div>
              <div style={{ textAlign: "center" }}>
                Select any supporter to start a conversation
              </div>
            </>
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
    </div>
  );
};

export default Chatroom;
