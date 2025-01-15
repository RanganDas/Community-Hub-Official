import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";


const Forgetpassword = () => {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const URL = "https://sparklify-official.onrender.com";

  const handleForgetpassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${URL}/api/forget-password`, {
        email,
      });

      if (response.status === 200) {
        sessionStorage.setItem("email", email);
        toast.success("A verification code has been sent to your email.");
        setTimeout(() => {
          navigate("/verify-password"); // Navigate to verification page
        }, 4000);
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleForgetpassword} className="signup-form" autoComplete="off" style={{ marginTop: "200px" }}>
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
           
          </span>
          <p style={{ textAlign: "center", color: "gray", fontSize: "14px", marginBottom: "20px" }} htmlFor="email">
            Enter the email linked to your account
          </p>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            className="input-field"
            
          />
        </div>
        <button type="submit" style={{ background: "green", marginTop: "10px", marginBottom: "10px" }}>
          Next
        </button>
        <button onClick={() => navigate("/login")} style={{ background: "none",border:"1px solid rgb(113, 22, 22)", color:"rgb(113, 22, 22)", marginTop: "10px", marginBottom: "10px" }}>
          Back
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

export default Forgetpassword;
