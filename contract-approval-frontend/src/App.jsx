// src/App.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

import AdminApproval from './pages/AdminApproval';
import Login from "./pages/Login";
import Register from "./components/Register";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import ProcurementContracts from "./pages/ProcurementContracts";
import EditContract from "./pages/EditContract";
import ModificationRequestForm from './components/ModificationRequestForm';
import ApproverDashboard from "./pages/ApproverDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import ModificationApprovalDashboard from './components/ModificationApprovalDashboard';
import CreateContractForm from "./components/CreateContractForm"; 
import ProcurementLayout from "./layout/ProcurementLayout";
import ContractDetail from './pages/ContractDetail';


// Layout for Admin
function AdminLayout({ children }) {
  return (
    <div>
      {/* Admin header/sidebar here */}
      <main style={{ padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
}

// Role-based protection
function RoleProtectedRoute({ userRole, allowedRoles, children }) {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [provider, setProvider] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Decode token to extract role
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = decoded.role || decoded.user?.role;
          setUserRole(role?.toLowerCase());
          console.log("Decoded role from token in App.jsx:", role);
        } catch (err) {
          console.error("Failed to decode token:", err);
        }
      }

      // Connect wallet
      if (window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const signer = await browserProvider.getSigner();
          const account = await signer.getAddress();
          setProvider(browserProvider);
          setCurrentAccount(account);
        } catch (err) {
          console.error("Wallet connection error:", err);
        }
      }
    };

    init();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard/procurement" element={<ProcurementLayout currentAccount={currentAccount} />}>
          <Route index element={<ProcurementDashboard />} />
          <Route path="contracts" element={<ProcurementContracts />} />
          <Route path="contracts/view/:id" element={<ContractDetail />} /> 
          <Route path="contracts/edit/:id" element={<EditContract />} />
          <Route path="contracts/create" element={<CreateContractForm />} />
          <Route path="modification-requests" element={<ModificationRequestForm />} />
          <Route path="/dashboard/procurement/contracts/:id" element={<ContractDetail />} />

        </Route>


        <Route path="/dashboard/approver" element={<ApproverDashboard provider={provider} currentAccount={currentAccount} />} />
        <Route path="/dashboard/auditor" element={<AuditorDashboard />} />
        <Route path="/approver/modifications" element={<ModificationApprovalDashboard />} />

        <Route
          path="/dashboard/admin"
          element={
            <RoleProtectedRoute userRole={userRole} allowedRoles={['admin']}>
              <AdminLayout>
                <AdminApproval />
              </AdminLayout>
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
