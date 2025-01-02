import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css"; // Import the same CSS as VerifyCode
import { useEffect } from "react";

const VerifyLogin = () => {
  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");

  useEffect(() => {
    // Check if the session has a pending verification
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next box if a digit is entered
      if (value && index < 5) {
        e.target.nextSibling?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    // Validate code length
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    console.log("Sending data:", { email, verificationCode }); // Log the data being sent

    setLoading(true);
    try {
      const response = await axios.post(
        "https://community-hub-official.onrender.com/api/verify-login",
        {
          email,
          verificationCode,
        }
      );

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("token", token); // Save JWT to localStorage
        sessionStorage.removeItem("email"); // Clean up session storage
        toast.success("Login verified!");

        setTimeout(() => {
          navigate("/"); // Redirect to home page
        }, 4000);
      }
    } catch (error) {
      toast.error("Invalid code. Please try again.");
      setLoading(false);
      console.error("Error:", error.response?.data || error.message); // Log error for debugging
    }
  };

  return (
    
    <div className="verify-container">
      <form onSubmit={handleSubmit} className="verify-form">
        <h2>Enter Verification Code</h2>
        <div className="code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              onChange={(e) => handleInputChange(e, index)}
              className="code-input"
              maxLength="1"
              required
            />
          ))}
        </div>
        <button type="submit" disabled={loading} className="verify-button">
          {loading ? "Verifying..." : "Verify Code"}
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

export default VerifyLogin;
