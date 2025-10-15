import { useAuth } from "../contexts/AuthContext";
import OwnerDashboard from "./OwnerDashboard";
import ContractorDashboard from "./ContractorDashboard";

function Dashboard() {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user type
  if (user?.userType === "Owner") {
    return <OwnerDashboard />;
  } else if (user?.userType === "Contractor") {
    return <ContractorDashboard />;
  }

  // Fallback for no user or unknown user type
  return <div className="loading">Loading dashboard...</div>;
}

export default Dashboard;
