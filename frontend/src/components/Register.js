import React, { useState } from "react";
import "./style.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    //const notify = () => toast("Wow so easy!");

    if (password === confirmPassword) {
      try {
        const response = await axios.post(`${URL}/api/register`, {
          username,
          email,
          password,
        });

        if (response.status === 201) {
          sessionStorage.setItem("email", email);
          // In register.js or login.js
          sessionStorage.setItem("isPendingVerification", "true");

          // If registration is successful, show alert
          toast.success("A verification code has been sent to your email."); // Success message from server

          setTimeout(() => {
            navigate("/verify"); // Redirect to login page after success
          }, 4000);
        }
      } catch (error) {
        // Handle email already exists error
        if (error.response && error.response.status === 409) {
          toast.error("Email already exists");
        } else {
          toast.error("Error registering user. Please try again.");
        }
      }
    } else {
      toast.error("Passwords do not match!");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit} autoComplete="off">
        <h2 style={{ marginTop: "20px" }}>Register</h2>
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
              icon={faUser}
              style={{ color: "gray" }}
              size="lg"
            />
          </span>
          <input
            style={{ paddingLeft: "40px" }}
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="off"
            maxLength="15"
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
              icon={faEnvelope}
              style={{ color: "gray" }}
              size="lg"
            />
          </span>
          <input
            style={{ paddingLeft: "40px" }}
            autoComplete="off"
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            style={{ paddingLeft: "40px" }}
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
            title="Must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 8 characters long"
            required
          />
          <p className="password-instructions">
          Password must be at least 8 characters and include at least one
          lowercase letter, one uppercase letter, one number, and one special
          symbol.
        </p>
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
            style={{ paddingLeft: "40px" }}
            type="password"
            name="confirmPassword"
            placeholder="Retype Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button style={{ background: "green" }} type="submit">
          Register
        </button>
        <p
          style={{
            color: "gray",
            fontSize: "12px",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Already have an account?
        </p>
        <button
          style={{ marginTop: "0px", background: "green" }}
          onClick={() => navigate("/login")}
        >
          Login
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

      {/* ToastContainer for displaying toasts */}
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

export default Register;
