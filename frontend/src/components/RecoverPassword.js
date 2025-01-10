import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://community-hub-official.onrender.com/api/forgotpassword",
        { email }
      );
      if (response.status === 200) {
        toast.success("OTP sent to your email.");
        setTimeout(() => {
          navigate("/verify-password"); // Navigate to OTP verification page
        }, 4000);
      }
    } catch (error) {
      toast.error("Error sending OTP. Please check your email.");
    }
  };

  return (
    <div className="recovery-password-container">
      <form onSubmit={handleSubmit} className="recovery-password-form">
        <h2>Enter the email linked to your account</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" style={{ background: "green" }}>
          Send OTP
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

export default RecoverPassword;
