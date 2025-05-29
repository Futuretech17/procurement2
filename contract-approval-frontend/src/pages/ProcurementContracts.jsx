import React from "react";
import ContractList from "../components/ContractList";
import Sidebar from "../components/Sidebar";

const ProcurementContracts = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Procurement Contracts</h2>
        <div className="bg-white p-6 rounded shadow">
          <ContractList />
        </div>
      </div>
    </div>
  );
};

export default ProcurementContracts;
