import { jwtDecode } from "jwt-decode"; // Use named import
import { useEffect } from "react";
import { toast } from "react-toastify";

const useTokenExpirationCheck = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token); // Correctly use the named export
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired
          
          localStorage.removeItem("token");
          setTimeout(() => {
            toast.error("Session expired. Please log in again.");
          }, 3000);
          window.location.href = "/login"; // Redirect to login
        }
      }
    }, 1000); // Check every 1 minute

    return () => clearInterval(interval);
  }, []);
};

export default useTokenExpirationCheck;
