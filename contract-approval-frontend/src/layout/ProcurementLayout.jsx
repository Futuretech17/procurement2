// src/layouts/ProcurementLayout.jsx
import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function ProcurementLayout({ children, currentAccount }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header currentAccount={currentAccount} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
