// src/components/Header.jsx
import React from 'react';

export default function Header({ currentAccount }) {
  return (
    <header style={{ padding: '10px 20px', backgroundColor: '#222', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>Procurement System</div>
        <div>
          {/* Display logged in account */}
          Logged in as: <strong>{currentAccount || 'Guest'}</strong>
        </div>
      </div>
    </header>
  );
}
