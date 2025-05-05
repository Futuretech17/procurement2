import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import ApproverDashboard from "./pages/ApproverDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/procurement" element={<ProcurementDashboard />} />
        <Route path="/dashboard/approver" element={<ApproverDashboard />} />
        <Route path="/dashboard/auditor" element={<AuditorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
