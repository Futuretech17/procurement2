import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import ApproverDashboard from "./pages/ApproverDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import ModificationApprovalDashboard from './components/ModificationApprovalDashboard';

function App() {
  const [provider, setProvider] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const account = await signer.getAddress();
        setProvider(browserProvider);
        setCurrentAccount(account);
      }
    };
    connectWallet();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/procurement" element={<ProcurementDashboard />} />
        <Route
          path="/dashboard/approver"
          element={<ApproverDashboard provider={provider} currentAccount={currentAccount} />}
        />
        <Route path="/dashboard/auditor" element={<AuditorDashboard />} />
        <Route path="/approver/modifications" element={<ModificationApprovalDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
