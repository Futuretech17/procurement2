// src/components/ProcurementSidebar.jsx

import { Link } from 'react-router-dom';

const ProcurementSidebar = () => {
  return (
    <nav style={{ width: '220px', padding: '20px', borderRight: '1px solid #ddd' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/dashboard/procurement">Dashboard</Link></li>
        <li><Link to="/dashboard/procurement/contracts">Contracts</Link></li>
        <li><Link to="/dashboard/procurement/contracts/create">Create Contract</Link></li>
        <li><Link to="/dashboard/procurement/modification-requests">Modification Requests</Link></li>
      </ul>
    </nav>
  );
};

export default ProcurementSidebar;
