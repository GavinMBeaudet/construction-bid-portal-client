import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getBidsByContractor } from "../services/apiService";

function Bids() {
  const { user, logout } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      setLoading(true);
      const data = await getBidsByContractor(user.id);
      setBids(data);
    } catch (err) {
      setError("Failed to load your bids");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bids-page">
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
        <div className="page-header">
          <h1>My Bids</h1>
          <Link to="/projects" className="btn btn-primary">
            Browse Projects
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading your bids...</div>
        ) : bids.length === 0 ? (
          <div className="empty-state">
            <p>You haven't submitted any bids yet.</p>
            <Link to="/projects" className="btn btn-primary">
              Browse Projects to Bid On
            </Link>
          </div>
        ) : (
          <div className="bids-list">
            {bids.map((bid) => (
              <div key={bid.id} className="bid-item">
                <div className="bid-item-header">
                  <div>
                    <h3>{bid.project?.title}</h3>
                    <p className="bid-project-location">
                      {bid.project?.location}
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
                      <strong>Your Bid:</strong> ${bid.amount.toLocaleString()}
                    </div>
                    <div className="detail-item">
                      <strong>Project Budget:</strong> $
                      {bid.project?.budget.toLocaleString()}
                    </div>
                    <div className="detail-item">
                      <strong>Submitted:</strong>{" "}
                      {new Date(bid.dateSubmitted).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bid-proposal">
                    <h4>Your Proposal:</h4>
                    <p>{bid.proposal}</p>
                  </div>
                </div>

                <div className="bid-item-actions">
                  <Link
                    to={`/projects/${bid.projectId}`}
                    className="btn btn-secondary"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Bids;
