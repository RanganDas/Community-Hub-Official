import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UpdateProfile.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateProfile = () => {
  const [userData, setUserData] = useState({
    bio: "",
    phoneNumber: "",
    city: "",
    dateOfBirth: "",
    job: "",
    age: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false); // Set to false initially
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 100); // Optional: Simulate loading for a moment
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const handleJobSelection = (job) => {
    setUserData({ ...userData, job });
    setDropdownVisible(false); // Close the dropdown after selection
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    axios
      .put("http://localhost:5000/api/user/profile/update", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        toast.success("Profile Information Updated Successfully");
        setTimeout(() => {
          navigate("/profile");
        }, 4000); // Redirect after success
      })
      .catch((error) => {
        console.error("Error updating profile", error);
        setError("Failed to update profile.");
      });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="update-profile-container">
      <div className="update-profile-card">
        <h2>Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="profile-picture-container2">
            <img
              src={userData.imageUrl || "./empty.png"}
              alt="Profile"
              className="profile-picture2"
            />
          </div>
          <div className="form-group">
            <label>Add profile picture</label>
            <textarea
              type="text"
              name="imageUrl"
              value={userData.imageUrl}
              onChange={handleChange}
              placeholder="Enter a valid picture url"
            />
          </div>
          <div className="form-group">
            <textarea
              type="textarea"
              name="bio"
              value={userData.bio}
              onChange={handleChange}
              placeholder="Enter bio"
              maxLength="300"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              maxLength="10" // Enforce 10 digits maximum
              pattern="\d*" // Only digits allowed
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Replace non-numeric characters
              }}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="city"
              value={userData.city}
              onChange={handleChange}
              placeholder="Enter city"
              maxLength="85"
            />
          </div>
          <div className="form-group">
            <input
              type="date"
              name="dateOfBirth"
              value={userData.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            
            <div className="job-input-container">
              <input
                type="text"
                name="job"
                value={userData.job} // Show a default text if no job is selected
                readOnly // Make the input read-only, so the user can't type in it
                onClick={() => setDropdownVisible(!dropdownVisible)} // Toggle dropdown on click
                placeholder="Click here to select a job"
              />
             
            
            </div>
            {dropdownVisible && (
              <div className="job-dropdown">
                <ul>
                  <li onClick={() => handleJobSelection("Software Developer")}>Software Developer</li>
                  <li onClick={() => handleJobSelection("Product Manager")}>Product Manager</li>
                  <li onClick={() => handleJobSelection("Designer")}>Designer</li>
                  <li onClick={() => handleJobSelection("Data Analyst")}>Data Analyst</li>
                  <li onClick={() => handleJobSelection("Teacher")}>Teacher</li>
                  <li onClick={() => handleJobSelection("Doctor")}>Doctor</li>
                  <li onClick={() => handleJobSelection("Engineer")}> Engineer</li>
                  <li onClick={() => handleJobSelection("Nurse")}>Nurse</li>
                  <li onClick={() => handleJobSelection("Architect")}>Architect</li>
                  <li onClick={() => handleJobSelection("Lawyer")}>Lawyer</li>
                  <li onClick={() => handleJobSelection("Accountant")}>Accountant</li>
                  <li onClick={() => handleJobSelection("Chef")}>Chef</li>
                  <li onClick={() => handleJobSelection("Scientist")}>Scientist</li>
                  <li onClick={() => handleJobSelection("Influencer")}>Influencer</li>
                  <li onClick={() => handleJobSelection("Artist")}>Artist</li>
                  <li onClick={() => handleJobSelection("Buisnessman")}>Buisnessman</li>
                  <li onClick={() => handleJobSelection("Other")}>Other</li>
                </ul>
              </div>
            )}
          </div>
          <div className="form-group">
            <input
              type="number"
              name="age"
              value={userData.age}
              onChange={handleChange}
              placeholder="Enter age"
              min="5" // Ensure the minimum age is 0
              max="90" // Set the maximum age to 100
              onInput={(e) => {
                if (e.target.value > 90) {
                  e.target.value = 90; // Prevents the user from entering a value greater than 100
                }
              }}
            />
          </div>
          <div className="button-group">
            <button type="submit" className="submit-button-11">
              Update
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="back-button-11"
            >
              Back
            </button>
          </div>
        </form>
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
  );
};

export default UpdateProfile;
