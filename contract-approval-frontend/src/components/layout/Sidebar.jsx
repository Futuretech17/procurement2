// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 min-h-screen bg-blue-900 text-white p-6 shadow-lg">
      <h3 className="text-2xl font-bold mb-6">Procurement</h3>
      <ul className="space-y-4">
        <li>
          <Link to="/dashboard/procurement" className="hover:text-gray-300">Dashboard</Link>
        </li>
        <li>
          <Link to="/dashboard/procurement/contracts" className="hover:text-gray-300">Contracts</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
