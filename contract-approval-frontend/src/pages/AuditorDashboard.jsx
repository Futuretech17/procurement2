
// src/pages/AuditorDashboard.jsx
import ModificationLogViewer from "../components/ModificationLogViewer";

const AuditorDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Auditor Dashboard</h1>
      <ModificationLogViewer />
    </div>
  );
};

export default AuditorDashboard;
