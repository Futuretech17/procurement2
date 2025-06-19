import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export default function AuditorLayout({ currentAccount }) {
  return (
    <div className="flex flex-col h-screen">
      <Header currentAccount={currentAccount} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="auditor" />

        <main className="flex-1 p-6 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
