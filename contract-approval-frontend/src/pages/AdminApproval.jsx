import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [roleSelections, setRoleSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch pending users
  useEffect(() => {
    async function fetchPendingUsers() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('/admin/pending-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Pending users response:', res.data);
        // Defensive check
        if (Array.isArray(res.data.users)) {
          setPendingUsers(res.data.users);
        } else {
          console.warn('res.data.users is not an array, setting empty array');
          setPendingUsers([]);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load pending users');
        setLoading(false);
      }
    }

    fetchPendingUsers();
  }, []);

  // Approve user with selected role
  async function approveUser(userId, role) {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`/admin/approve-user/${userId}`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMsg(`User approved as ${role}`);
      setError('');

      setPendingUsers(pendingUsers.filter(user => user._id !== userId));

      const updatedRoles = { ...roleSelections };
      delete updatedRoles[userId];
      setRoleSelections(updatedRoles);
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
      setSuccessMsg('');
    }
  }

  if (loading) return <p>Loading pending users...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // Defensive: make sure pendingUsers is an array before calling .length
  const usersList = Array.isArray(pendingUsers) ? pendingUsers : [];

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '1rem' }}>
      <h2>Pending User Approvals</h2>
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      {usersList.length === 0 ? (
        <p>No pending users found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Assign Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={roleSelections[user._id] || 'procurement'}
                    onChange={e =>
                      setRoleSelections({ ...roleSelections, [user._id]: e.target.value })
                    }
                  >
                    <option value="procurement">Procurement</option>
                    <option value="approver">Approver</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() =>
                      approveUser(user._id, roleSelections[user._id] || 'procurement')
                    }
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminApproval;
