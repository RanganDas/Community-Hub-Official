import React, { useEffect, useState } from "react";
import axios from "axios";
import "./News.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
const News = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const sizeClasses = ["small"]; 
  const navigate = useNavigate();// Add more classes as needed
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
     const response = await axios.get('https://community-hub-official.onrender.com/api/news');
      setArticles(response.data.articles);
    } catch (err) {
      setError("Failed to fetch news. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []); // Fetch news on component mount

  if (isLoading) {
    return <div className="news-container">Loading news...</div>;
  }

  if (error) {
    return <div className="news-container error">{error}</div>;
  }

  return (
    <div className="news-page">
      {/* Navbar */}
      <nav className="news-navbar">
        <div className="navbar-left">
          <h1 className="navbar-title">Latest News</h1>
        </div>
        <button className="refresh-button" onClick={() => { fetchNews(); }}>
          <FontAwesomeIcon
            icon={faArrowsRotate} // Use the imported icon here
            style={{ color: "gray" }}
          />
        </button>
        <button className="news-back-button" onClick={() => navigate("/")}>Back to Home</button>
      </nav>
      {/* News Grid */}
      <div className="news-grid">
        {articles.map((article, index) => {
          // Assign a random size class for width/height variation
          const randomSizeClass =
            sizeClasses[Math.floor(Math.random() * sizeClasses.length)];
          return (
            <div key={index} className={`news-card ${randomSizeClass}`}>
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="news-image"
                />
              )}
              <div className="news-content">
                <h3 className="news-title">{article.title}</h3>
                <p className="news-description">
                  {article.description || "No description available."}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="read-more"
                >
                  Read more
                </a>
              </div>
            </div>
          );
        })}
      </div>
      ;
    </div>
  );
};

export default News;
