import React from "react";
import ApproveContractList from "../components/ApproveContractList";

const ApproverDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Approver Dashboard</h2>
      <ApproveContractList />
    </div>
  );
};

export default ApproverDashboard;
