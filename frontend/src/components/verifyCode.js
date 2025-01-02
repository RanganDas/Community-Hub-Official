import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css"; // Import CSS file for styling
import { useNavigate } from 'react-router-dom';

const VerifyCode = () => {
  const [code, setCode] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");

  useEffect(() => {
    const isPendingVerification = sessionStorage.getItem("isPendingVerification");

    // Redirect to login if no pending verification
    if (!isPendingVerification) {
      navigate('/register');
    }
  }, [navigate]);

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
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/verify', { 
        email,
        verificationCode
      });
      if (response.status === 400) {
          toast.error("Wrong code entered"); 
        }
      if (response.status === 200) {
        const { token } = response.data;
          if (token) {
            localStorage.setItem("token", token); // Store token in localStorage
            console.log("Token saved:", token); // Debugging line to check token
            // Redirect to home page or another route
          } else {
            console.log("Token not found in response");
          }
        toast.success('Verification successful!');
        
        setTimeout(() => {
            navigate('/');
        }, 4000);
        
      }
    } catch (error) {
      setLoading(false);
      toast.error('Invalid or expired code. Please try again.');
    }
  };

  return (
    <div className="verify-container">
      <form onSubmit={handleSubmit} className="verify-form">
        <h2>Enter the 6-Digit Code</h2>
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
          {loading ? 'Verifying...' : 'Verify Code'}
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

export default VerifyCode;
