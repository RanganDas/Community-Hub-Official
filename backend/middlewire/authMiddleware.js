const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = function (req, res, next) {
  // Get token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data (user id and email) to the request object
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
