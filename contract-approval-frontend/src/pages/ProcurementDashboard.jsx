import React from "react";
import ContractList from "../components/ContractList";
import CreateContractForm from "../components/CreateContractForm";
import Sidebar from "../components/layout/Sidebar"; // Reusing your existing sidebar

const ProcurementDashboard = () => {
  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Procurement Officer Dashboard</h2>
        {/* Contract Creation Card */}
        <div className="bg-white p-6 rounded shadow mb-8">
          {/* <h3 className="text-lg font-semibold mb-4">Create New Contract</h3> */}
          <CreateContractForm />
        </div>

        {/* Contract List Card */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Procurement Contracts</h3>
          <ContractList />
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
