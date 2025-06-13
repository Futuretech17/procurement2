import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const ApproverLayout = ({ currentAccount }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar role="approver" />
      <div style={{ flex: 1, padding: '1rem' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default ApproverLayout;
