import React, { useState, useEffect } from "react";
import Chatroom from "./Chatroom"; // Your existing Chatroom component
import MobileChat from "./MobileChat"; // The component for smaller screens

const ResponsiveChat = () => {
  const [isMobile, setIsMobile] = useState(null); // Start with null to prevent incorrect rendering on initial load.

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 401);
    };

    // Set initial state after the component mounts
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Avoid rendering until the `isMobile` state is determined
  if (isMobile === null) {
    return null; // Optionally, return a loading spinner or placeholder.
  }

  return isMobile ? <MobileChat /> : <Chatroom />;
};

export default ResponsiveChat;
