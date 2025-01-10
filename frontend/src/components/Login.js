import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://community-hub-official.onrender.com/api/login", {
        email,
        password,
      });

      if (response.status === 200) {
        sessionStorage.setItem("email", email);
        toast.success("A verification code has been sent to your email.");
        setTimeout(() => {
          navigate("/verify-login"); // Navigate to verification page
        }, 4000);
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleLogin} className="signup-form" autoComplete="off">
        <h2 style={{ marginTop: "20px" }}>Login</h2>

        <div style={{ position: "relative", marginTop: "40px" }}>
          <span
            className="input-icon"
            style={{
              position: "absolute",
              left: "10px",
              top: "42.5%",
              transform: "translateY(-50%)",
              color: "gray",
            }}
          >
            <FontAwesomeIcon
              icon={faEnvelope}
              style={{ color: "gray" }}
              size="lg"
            />
          </span>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            className="input-field"
            style={{ paddingLeft: "40px" }} 
          />
        </div>

        <div style={{ position: "relative" }}>
          <span
            className="input-icon"
            style={{
              position: "absolute",
              left: "10px",
              top: "42.5%",
              transform: "translateY(-50%)",
              color: "gray",
            }}
          >
           <FontAwesomeIcon
              icon={faLock}
              style={{ color: "gray" }}
              size="lg"
            />
          </span>
          <input
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
            style={{ paddingLeft: "40px" }} // Ensure padding so text doesn't overlap with the icon
          />
        </div>

        <button type="submit" style={{ background: "green" }}>
          Login
        </button>
        <p
          style={{
            color: "gray",
            fontSize: "12px",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          New to commubity hub?
        </p>
        <button
          style={{ marginTop: "0px", background: "green" }}
          type="button"
          onClick={() => navigate("/register")}
        >
          Signup
        </button>
        <button
          style={{
            background: "none",
            textDecoration: "underline",
            border: "none",
            color: "gray",
            fontSize: "15px",
            textAlign: "center",
          }}
          onClick={() => navigate("/")}
        >
          Stay logged out
        </button>
      </form>

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

export default Login;
