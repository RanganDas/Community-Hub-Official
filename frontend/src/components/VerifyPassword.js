import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css"; // Import the same CSS as VerifyCode
import { useEffect } from "react";

const VerifyPassword = () => {
  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");

  const URL = "https://sparklify-official.onrender.com";
  
  useEffect(() => {
    // Check if the session has a pending verification
    if (!email) {
      navigate("/forgetpassword");
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
  
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
  
    console.log("Sending data to backend:", { email, verificationCode }); // Log the email and OTP
    setLoading(true);
  
    try {
      const response = await axios.post(`${URL}/api/verify-password`, {
        email,
        verificationCode,
      });
  
      if (response.status === 200) {
        toast.success("Email verified!");
        
        setTimeout(() => {
          navigate("/change-password");
        }, 3000);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error.response?.data || error.message); // Log backend response
      toast.error(error.response?.data.message || "Verification failed. Please try again.");
      setLoading(false);
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

export default VerifyPassword;
