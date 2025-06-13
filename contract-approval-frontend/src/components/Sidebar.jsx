// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ role }) {
  const menuItems = {
    procurement: [
      { label: 'Dashboard', path: '/dashboard/procurement' },
      { label: 'All Contracts', path: '/dashboard/procurement/contracts' },
      { label: 'Create Contract', path: '/dashboard/procurement/contracts/create' },
      { label: 'Modification Requests', path: '/dashboard/procurement/modification-requests' },
      { label: 'Audit Trail', path: '/dashboard/procurement/audit-trail' },
      { label: 'Profile', path: '/dashboard/procurement/profile' },
    ],
    approver: [
      { label: 'Dashboard', path: '/dashboard/approver' },
      { label: 'Pending Contract Approvals', path: '/dashboard/approver/pending-approvals' },
      { label: 'All Contracts', path: '/dashboard/approver/contracts' },
      { label: 'Modification Requests', path: '/dashboard/approver/modification-requests' },
      { label: 'Audit Trail', path: '/dashboard/approver/audit-trail' },
      { label: 'Profile', path: '/dashboard/approver/profile' },
    ],
  };

  const items = menuItems[role] || [];

  return (
    <nav style={{
      width: '220px',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      boxSizing: 'border-box',
      height: '100vh',
    }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(({ label, path }) => (
          <li key={path} style={{ marginBottom: '12px' }}>
            <NavLink 
              to={path} 
              style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#007bff' : '#333',
                fontWeight: isActive ? 'bold' : 'normal',
              })}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
