// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { login } from '../services/authService';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = await login({ username, email, password });
      console.log('Login success:', data);

      // Save token
      localStorage.setItem('authToken', data.token);

      // Decode token
      const decoded = jwtDecode(data.token);
      console.log('Decoded token:', decoded);
      const role = (decoded.role || decoded.userRole || decoded.user?.role || '').toLowerCase();
      console.log('User role:', role);

      setSuccess('Login successful! Redirecting...');

      // Delay to show success message, then navigate
      setTimeout(() => {
        switch (role) {
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'procurement':
            navigate('/dashboard/procurement');
            break;
          case 'approver':
            navigate('/dashboard/approver');
            break;
          case 'auditor':
            navigate('/dashboard/auditor');
            break;
          default:
            navigate('/');
        }
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: 'auto',
      padding: '2rem',
      backgroundColor: '#f9fafb',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: 'Roboto, sans-serif'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 'bold' }}>Username:</label><br />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '5px', border: '1px solid #ccc' }} /><br />

        <label style={{ fontWeight: 'bold' }}>Email:</label><br />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '5px', border: '1px solid #ccc' }} /><br />

        <label style={{ fontWeight: 'bold' }}>Password:</label><br />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '5px', border: '1px solid #ccc' }} /><br />

        <button type="submit" style={{ backgroundColor: '#2980b9', color: '#fff', padding: '0.7rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Login</button>
      </form>

      {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

export default LoginForm;
