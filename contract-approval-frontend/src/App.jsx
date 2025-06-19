import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

import AdminApproval from './pages/AdminApproval';
import Login from "./pages/Login";
import Register from "./components/Register";
import ProcurementDashboard from "./pages/procurementOfficer/ProcurementDashboard";
import ProcurementContracts from "./pages/procurementOfficer/ProcurementContracts";
import EditContract from "./pages/procurementOfficer/EditContract";
import ModificationRequestForm from './components/ModificationRequestForm';
import ApproverDashboard from "./pages/approver/ApproverDashboard";
import AuditorDashboard from "./pages/auditor/AuditorDashboard";
import ModificationApprovalDashboard from './components/ModificationApprovalDashboard';
import CreateContractForm from "./components/CreateContractForm";
import ProcurementLayout from "./layout/ProcurementLayout";
import ApproverLayout from "./layout/ApproverLayout";
import AuditorLayout from "./layout/AuditorLayout";
import ContractDetail from './components/ContractDetail';
import PendingApprovals from "./pages/approver/PendingApprovals";
import ApprovedContracts from "./pages/approver/ApprovedContracts";
import AllContracts from "./components/AllContracts";
import ProcurementModificationRequests from './pages/procurementOfficer/ProcurementModificationRequests'; // ⬅️ Add this import at the top
import AuditTrailViewer from "./components/AuditTrailViewer";
import UserProfile from './components/UserProfile';
import ApproverModificationRequests from './pages/approver/ApproverModificationRequests';
import AuditorAllContracts from "./pages/auditor/AuditorAllContracts"; 
import AuditorModificationRequests from './pages/auditor/AuditorModificationRequests';



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

        {/* Procurement Officer Routes */}
        <Route path="/dashboard/procurement" element={<ProcurementLayout currentAccount={currentAccount} />}>
          <Route index element={<ProcurementDashboard />} />
          <Route path="contracts" element={<ProcurementContracts />} />
          <Route path="contracts/view/:id" element={<ContractDetail />} />
          <Route path="contracts/edit/:id" element={<EditContract />} />
          <Route path="contracts/create" element={<CreateContractForm />} />
          <Route path="contracts/request-modification/:id" element={<ModificationRequestForm />} />
          <Route path="modification-requests" element={<ProcurementModificationRequests />} />
          <Route path="audit-trail" element={<AuditTrailViewer />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Approver Routes */}
        <Route path="/dashboard/approver" element={<ApproverLayout currentAccount={currentAccount} />}>
          <Route index element={<ApproverDashboard provider={provider} currentAccount={currentAccount} />} />
          <Route path="pending-approvals" element={<PendingApprovals />} />
          <Route path="approved-contracts" element={<ApprovedContracts />} />
          <Route path="contracts" element={<AllContracts />} />
          <Route path="contracts/view/:id" element={<ContractDetail />} /> {/* ✅ Added this line */}
          <Route path="modification-requests" element={<ApproverModificationRequests />} />
          <Route path="audit-trail" element={<AuditTrailViewer />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Auditor Routes */}
        <Route path="/dashboard/auditor" element={<AuditorLayout currentAccount={currentAccount} />}>
          <Route index element={<AuditorDashboard />} />
          <Route path="contracts" element={<AuditorAllContracts />} />
          <Route path="modification-requests" element={<AuditorModificationRequests />} />
          <Route path="audit-trail" element={<AuditTrailViewer />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Admin Route */}
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

        {/* Other Routes */}
        <Route path="/approver/modifications" element={<ModificationApprovalDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
