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
import ApproverDashboard from "./pages/approver/ApproverDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import ModificationApprovalDashboard from './components/ModificationApprovalDashboard';
import CreateContractForm from "./components/CreateContractForm";
import ProcurementLayout from "./layout/ProcurementLayout";
import ContractDetail from './pages/ContractDetail';
import ApproverLayout from "./layout/ApproverLayout"; // ✅ NEW LAYOUT

// Admin Layout
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

// Role-based route protection
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

        {/* Procurement Routes */}
        <Route path="/dashboard/procurement" element={<ProcurementLayout currentAccount={currentAccount} />}>
          <Route index element={<ProcurementDashboard />} />
          <Route path="contracts" element={<ProcurementContracts />} />
          <Route path="contracts/view/:id" element={<ContractDetail />} />
          <Route path="contracts/edit/:id" element={<EditContract />} />
          <Route path="contracts/create" element={<CreateContractForm />} />
          <Route path="modification-requests" element={<ModificationRequestForm />} />
          <Route path="audit-trail" element={<div>Audit Trail (Coming Soon)</div>} />  {/* 👈 now works */}
          <Route path="profile" element={<div>Procurement Profile (Coming Soon)</div>} /> {/* 👈 now works */}
        </Route>


        {/* Approver Routes */}
        <Route path="/dashboard/approver" element={<ApproverLayout currentAccount={currentAccount} />}>
          <Route index element={<ApproverDashboard provider={provider} currentAccount={currentAccount} />} />
          <Route path="pending-approvals" element={<div>Pending Approvals (Coming Soon)</div>} />
          <Route path="approved-contracts" element={<div>Approved Contracts (Coming Soon)</div>} />
          <Route path="contracts" element={<div>All Contracts (Coming Soon)</div>} />
          <Route path="modification-requests" element={<div>Modification Requests (Coming Soon)</div>} />
          <Route path="audit-trail" element={<div>Audit Trail (Coming Soon)</div>} />
          <Route path="profile" element={<div>Approver Profile (Coming Soon)</div>} />
        </Route>

        {/* Auditor + Admin */}
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
