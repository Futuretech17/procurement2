import React from "react";
import CreateContractForm from "../components/CreateContractForm";
import Sidebar from "../components/Sidebar";

const ProcurementDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Procurement Officer Dashboard</h2>
        <div className="bg-white p-6 rounded shadow mb-8">
          <CreateContractForm />
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
