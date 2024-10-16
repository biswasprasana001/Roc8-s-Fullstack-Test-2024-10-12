import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get('token');  // Assuming token is stored in cookies

  // Check if user is authenticated (has a valid token)
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Optional: You can decode and validate the token with jwt_decode
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      // Token expired, redirect to login
      return <Navigate to="/login" />;
    }
  } catch (error) {
    // Invalid token, redirect to login
    return <Navigate to="/login" />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;