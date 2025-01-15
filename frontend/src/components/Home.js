import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import SideNavbar from "./SideNavbar";
import PostModal from "./PostModal";
import PostCard from "./PostCard";
import "./Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const URL = "https://sparklify-official.onrender.com";
  // Fetch posts from the backend with pagination
 useEffect(() => {
  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        currentPage === 0
          ? `${URL}/api/posts/getposts` // Fetch all posts
          : `${URL}/api/posts/getposts?page=${currentPage}` // Fetch paginated posts
      );
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages || 1); // Handle totalPages for both cases
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  fetchPosts();
}, [currentPage]);


  // Handle new post creation
  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]); // Add new post to the top of the list
  };

  // Change page handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // Update the current page when a page number is clicked
  };

  return (
    <div>
      <Navbar />
      <SideNavbar />
      <button onClick={() => setIsModalOpen(true)}>Create Post</button>
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
      <div className="posts-container">
        <div className="posts-container2">
          <div className="posts-container3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      </div>

      {/* Show pagination only if there are multiple pages */}
    {totalPages > 1 && (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    )}
    </div>
  );
};

export default Home;
