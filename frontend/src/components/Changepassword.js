import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";

const Changepassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const URL = "https://sparklify-official.onrender.com";

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password should be at least 6 characters long.");
      return;
    }

    try {
      const email = sessionStorage.getItem("email");
      if (!email) {
        toast.error("No email found. Please start the process again.");
        navigate("/forgetpassword");
        return;
      }

      const response = await axios.post(`${URL}/api/create-new-password`, {
        email,
        newPassword,
      });

      if (response.status === 200) {
        toast.success("Password updated successfully.");
        sessionStorage.removeItem("email");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      
      toast.error(
        error.response?.data?.message || "Failed to update password. Try again."
      );
    }
  };

  return (
    <div className="signup-container">
      <form
        onSubmit={handleChangePassword}
        className="signup-form"
        autoComplete="off"
        style={{ marginTop: "200px" }}
      >
        <h2 style={{ textAlign: "center" }}>Create New Password</h2>
        <div style={{ position: "relative", marginTop: "40px" }}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="off"
            className="input-field"
          />
          <input
            type="password"
            placeholder="Retype new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="off"
            className="input-field"
          />
        </div>
        <button
          type="submit"
          style={{
            background: "green",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            background: "none",
            border: "1px solid rgb(113, 22, 22)",
            color: "rgb(113, 22, 22)",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
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

export default Changepassword;
