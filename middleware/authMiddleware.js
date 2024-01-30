const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const asyncHandler = require('express-async-handler');

const verifyJWT = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.sendStatus(401);
    }
  
    const token = authHeader.split(' ')[1];
  
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Ensure that the decoded object contains the email and role fields
        const { email, role } = decoded.UserInfo;
        let id = decoded.UserInfo.id
        req.user = { id,email, role }; // Set the req.user object with email and role
        console.log(req.user)
        console.log(decoded); 
        next();
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      return res.status(403).json({ message: 'Token expired or invalid, please login again' });
    }
  });

const isAdmin = (req, res, next) => {
    // Check if the user role is "admin"
    if (req.user && req.user.role === "admin") {
      // User is an admin, proceed to the next middleware or route handler
      console.log("User is an admin. Role:", req.user);
      next();
    } else {
      // User is not an admin, send a response with status 403 (forbidden)
      console.log("User is not an admin. Role:", req.user.role);
      res.status(403).json({ message: "You do not have permission to access this resource." });
    }
  };
  

module.exports = { verifyJWT, isAdmin };
