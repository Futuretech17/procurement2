// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#222',
      color: 'white',
      textAlign: 'center',
      padding: '10px 20px',
      position: 'sticky',
      bottom: 0,
      width: '100%',
      fontSize: '14px',
      marginTop: 'auto'
    }}>
      &copy; {new Date().getFullYear()} Procurement System. All rights reserved.
    </footer>
  );
}
