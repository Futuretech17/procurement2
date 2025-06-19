import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../../utils/contract";
import ModificationRequestTable from "../../components/ModificationRequestTable";

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  card: {
    maxWidth: "1000px",
    margin: "0 auto",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
  },
  header: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "1rem",
  },
};

const ProcurementModificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const contract = await getProcurementContract();
        const total = await contract.getTotalContracts();

        const fetched = [];
        for (let i = 1; i <= total; i++) {
          const isRequested = await contract.isModificationPending(i);
          if (isRequested) {
            const data = await contract.getContractByIndex(i - 1);
            fetched.push({
              id: Number(data[0]),
              title: data[1],
              supplier: data[3],
              value: Number(data[5]),
              startDate: new Date(Number(data[10]) * 1000).toLocaleDateString(),
              deliveryDate: new Date(Number(data[11]) * 1000).toLocaleDateString(),
            });
          }
        }

        setRequests(fetched);
      } catch (err) {
        console.error("Failed to fetch modification requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>My Modification Requests</h2>
        {loading ? <p>Loading...</p> : <ModificationRequestTable data={requests} role="procurement" />}
      </div>
    </div>
  );
};

export default ProcurementModificationRequests;
