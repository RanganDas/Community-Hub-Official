import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyPassword = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to the next box if a digit is entered
      if (value && index < 5) {
        e.target.nextSibling?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://community-hub-official.onrender.com/api/verify-otp",
        { email, otp: enteredOtp }
      );
      if (response.status === 200) {
        toast.success("OTP verified successfully!");
        setTimeout(() => {
          navigate("/change-password"); // Navigate to change password page
        }, 4000);
      }
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="verify-password-container">
      <form onSubmit={handleSubmit} className="verify-password-form">
        <h2>Enter the OTP sent to your email</h2>
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              onChange={(e) => handleInputChange(e, index)}
              className="otp-input"
              maxLength="1"
              required
            />
          ))}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
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
