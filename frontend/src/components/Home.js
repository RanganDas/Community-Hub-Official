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

  // Fetch posts from the backend with pagination
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `https://community-hub-official.onrender.com/posts/getposts?page=${currentPage}`
        );
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages); // Set total pages from the backend response
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [currentPage]); // Refetch posts when the current page changes

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

     {/* Only show pagination if there are more than 10 posts */}
     {totalPages > 1 && posts.length > 0 && (
        <div className="pagination">
          {currentPage > 1 && (
            <button onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </button>
          )}
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <button onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
