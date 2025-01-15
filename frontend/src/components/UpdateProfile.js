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
  const [locationSuggestions, setLocationSuggestions] = useState([]); // Location suggestions
  const [selectedLocation, setSelectedLocation] = useState(null); // Selected location
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const URL = "https://sparklify-official.onrender.com";
  const OPENCAGE_API_KEY = "f04de10f2b304f1d956f4b0bd8c96ecb"; // Replace with your API key

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });

    if (name === "location") {
      fetchLocationSuggestions(value); // Fetch location suggestions
    }
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query || query.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            key: OPENCAGE_API_KEY,
            q: query.trim(),
            limit: 3,
          },
        }
      );

      const suggestions = response.data.results.map((result) => ({
        formatted: result.formatted,
        geometry: result.geometry,
      }));

      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setUserData({ ...userData, city: value });
  
    if (value.length > 2) {
      fetchLocationSuggestions(value);
    } else {
      setLocationSuggestions([]); // Clear suggestions if input is too short
    }
  };

  const handleLocationSelect = (location) => {
    setUserData({ ...userData, city: location.formatted });
    setSelectedLocation(location);
    setLocationSuggestions([]);
  };

  const handleJobSelection = (job) => {
    setUserData({ ...userData, job });
    setDropdownVisible(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!selectedLocation) {
      toast.error("Please select a valid location from the suggestions.");
      return;
    }

    axios
      .put(`${URL}/api/user/profile/update`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        toast.success("Profile Information Updated Successfully");
        setTimeout(() => {
          navigate("/profile");
        }, 4000);
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
              placeholder="Enter a valid picture URL"
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
              maxLength="10"
              pattern="\d*"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="city" // Keep the name as "city" to match your backend field
              placeholder="Enter location"
              value={userData.city}
              onChange={handleLocationChange} // Custom handler for fetching location suggestions
            />
            {locationSuggestions.length > 0 && (
              <ul className="location-suggestions">
                {locationSuggestions.map((location, index) => (
                  <li
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className="location-suggestion-item"
                  >
                    {location.formatted}
                  </li>
                ))}
              </ul>
            )}
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
                value={userData.job}
                readOnly
                onClick={() => setDropdownVisible(!dropdownVisible)}
                placeholder="Click here to select a job"
              />
            </div>
            {dropdownVisible && (
              <div className="job-dropdown">
                <ul>
                  <li onClick={() => handleJobSelection("Software Developer")}>
                    Software Developer
                  </li>
                  <li onClick={() => handleJobSelection("Teacher")}>Teacher</li>
                  <li onClick={() => handleJobSelection("Engineer")}>
                    Engineer
                  </li>
                  <li onClick={() => handleJobSelection("Doctor")}>Doctor</li>
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
              min="5"
              max="90"
              onInput={(e) => {
                if (e.target.value > 90) {
                  e.target.value = 90;
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
