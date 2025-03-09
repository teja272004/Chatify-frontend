import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to Chat App</h1>
      <div className="space-x-4">
        <Link to="/login" className="px-4 py-2 bg-green-500 text-white rounded-lg">Login</Link>
        <Link to="/signup" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Signup</Link>
      </div>
    </div>
  );
};

export default LandingPage;