// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <nav style={{
      width: '220px',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      boxSizing: 'border-box',
      height: '100vh',
    }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/dashboard/procurement">Dashboard</Link></li>
        <li><Link to="/dashboard/procurement/contracts">Contracts</Link></li>
        <li><Link to="/dashboard/procurement/contracts/create">Create Contract</Link></li>
        <li><Link to="/dashboard/procurement/modification-requests">Modification Requests</Link></li>
      </ul>
    </nav>
  );
}
