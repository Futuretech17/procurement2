import React, { useState } from "react";
import { connectWalletAndGetRole } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const connect = async () => {
    try {
      const { address, role } = await connectWalletAndGetRole();
      setAddress(address);

      if (role === "PROCUREMENT") navigate("/dashboard/procurement");
      else if (role === "APPROVER") navigate("/dashboard/approver");
      else if (role === "AUDITOR") navigate("/dashboard/auditor");
      else alert("Access Denied: No role assigned.");
    } catch (err) {
      console.error(err.message);
      alert("Wallet connection failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Blockchain Procurement DApp</h2>
      <button onClick={connect} className="bg-blue-600 text-white px-4 py-2 rounded">
        Connect Wallet
      </button>
    </div>
  );
};

export default Login;
