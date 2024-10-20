// analytics-frontend\src\App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Chart from "./components/Chart";
import ChartPage from "./components/ChartShare";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";

const API_URL = "http://localhost:5000/api";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Protected Route for viewing charts */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chart />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Route for shared chart, protected */}
        <Route
          path="/share"
          element={
            <ProtectedRoute>
              <ChartPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
