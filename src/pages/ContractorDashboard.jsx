import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getBidsByContractor, getProjectById } from "../services/apiService";
import { BID_STATUS } from "../constants/status";

function ContractorDashboard() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    loadContractorBids();
  }, [user]);

  const loadContractorBids = async () => {
    try {
      setLoading(true);
      // Fetch all bids by this contractor
      const contractorBids = await getBidsByContractor(user.id);

      // For each bid, get the full project details
      const bidsWithProjects = await Promise.all(
        contractorBids.map(async (bid) => {
          try {
            const project = await getProjectById(bid.projectId);
            return {
              ...bid,
              project,
            };
          } catch (err) {
            // If fetching project fails, return bid without project details
            return bid;
          }
        })
      );

      setBids(bidsWithProjects);
    } catch (err) {
      setError("Failed to load your bids");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const pendingBids = bids.filter(
    (b) => b.status === BID_STATUS.PENDING
  ).length;
  const acceptedBids = bids.filter(
    (b) => b.status === BID_STATUS.ACCEPTED
  ).length;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Construction Bid Portal</h1>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/bids">My Bids</Link>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="dashboard-header">
          <h1>Contractor Dashboard</h1>
        </div>
        {/* Dashboard summary cards */}
        {!loading && bids.length > 0 && (
          <div
            className="dashboard-cards"
            style={{
              display: "flex",
              gap: 32,
              marginBottom: 32,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div
              className="dashboard-card"
              style={{
                background: "#f8f8fa",
                borderRadius: 12,
                padding: "1.5rem 0",
                flex: 1,
                minWidth: 0,
                boxShadow: "0 2px 8px #0001",
                textAlign: "center",
                maxWidth: 340,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                Total Bids
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#6c2eb7" }}>
                {bids.length}
              </div>
            </div>
            <div
              className="dashboard-card"
              style={{
                background: "#f8f8fa",
                borderRadius: 12,
                padding: "1.5rem 0",
                flex: 1,
                minWidth: 0,
                boxShadow: "0 2px 8px #0001",
                textAlign: "center",
                maxWidth: 340,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                Total Pending
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#f5a623" }}>
                {pendingBids}
              </div>
            </div>
            <div
              className="dashboard-card"
              style={{
                background: "#f8f8fa",
                borderRadius: 12,
                padding: "1.5rem 0",
                flex: 1,
                minWidth: 0,
                boxShadow: "0 2px 8px #0001",
                textAlign: "center",
                maxWidth: 340,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                Total Accepted
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#27ae60" }}>
                {acceptedBids}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading your bids...</div>
        ) : bids.length === 0 ? (
          <div className="empty-state">
            <p>You haven't submitted any bids yet.</p>
            <Link to="/projects" className="btn btn-primary">
              Browse Available Projects
            </Link>
          </div>
        ) : (
          <div className="bids-overview">
            <h2>Your Recent Bids</h2>
            <div className="bids-list">
              {bids.slice(0, 5).map((bid) => (
                <div key={bid.id} className="bid-item">
                  <div className="bid-item-header">
                    <div>
                      <h3>{bid.project?.title || "Project"}</h3>
                      <p className="bid-project-location">
                        {bid.project?.location || "Unknown location"}
                      </p>
                    </div>
                    <span
                      className={`status-badge status-${bid.status.toLowerCase()}`}
                    >
                      {bid.status}
                    </span>
                  </div>

                  <div className="bid-item-content">
                    <div className="bid-details">
                      <div className="detail-item">
                        <strong>Your Bid:</strong> $
                        {bid.finalContractPrice?.toLocaleString()}
                      </div>
                      <div className="detail-item">
                        <strong>Timeline:</strong> {bid.completionDays} days
                      </div>
                      <div className="detail-item">
                        <strong>Contractor:</strong> {bid.contractorName} (
                        {bid.contractorLicense})
                      </div>
                      <div className="detail-item">
                        <strong>Owner:</strong> {bid.ownerName}
                      </div>
                      <div className="detail-item">
                        <strong>Retention:</strong>{" "}
                        {bid.progressRetentionPercent}%
                      </div>
                      <div className="detail-item">
                        <strong>Warranty:</strong> {bid.warrantyYears} year(s)
                      </div>
                      <div className="detail-item">
                        <strong>Submitted:</strong>{" "}
                        {new Date(bid.dateSubmitted).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="bid-item-actions">
                    <Link
                      to={`/projects/${bid.projectId}`}
                      className="btn btn-secondary"
                    >
                      View Project
                    </Link>
                    <Link
                      to={`/bids/${bid.id}/edit`}
                      className="btn btn-primary"
                    >
                      Edit Bid
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {bids.length > 5 && (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <Link to="/bids" className="btn btn-primary">
                  View All Bids ({bids.length})
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="dashboard-info">
          <div className="info-card">
            <h4>Account Information</h4>
            <dl>
              <dt>Name:</dt>
              <dd>
                {user?.firstName} {user?.lastName}
              </dd>
              <dt>Email:</dt>
              <dd>{user?.email}</dd>
              <dt>User Type:</dt>
              <dd>{user?.userType}</dd>
              <dt>Address:</dt>
              <dd>{user?.address || "N/A"}</dd>
              <dt>City:</dt>
              <dd>{user?.city || "N/A"}</dd>
              <dt>State:</dt>
              <dd>{user?.state || "N/A"}</dd>
              <dt>Zip:</dt>
              <dd>{user?.zip || "N/A"}</dd>
              {user?.licenseNumber && (
                <>
                  <dt>License Number:</dt>
                  <dd>{user.licenseNumber}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContractorDashboard;
