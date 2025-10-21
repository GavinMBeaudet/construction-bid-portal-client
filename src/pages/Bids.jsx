import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getBidsByContractor, deleteBid } from "../services/apiService";
import ConfirmModal from "../components/ConfirmModal";

function Bids() {
  const { user, logout } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBid, setEditingBid] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [bidToWithdraw, setBidToWithdraw] = useState(null);

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

  const handleDeleteBid = (bidId) => {
    setBidToWithdraw(bidId);
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    if (!bidToWithdraw) return;
    try {
      await deleteBid(bidToWithdraw, user.id);
      setBids((prev) => prev.filter((b) => b.id !== bidToWithdraw));
      setShowWithdrawModal(false);
      setBidToWithdraw(null);
    } catch (err) {
      setError("Failed to delete bid");
      setShowWithdrawModal(false);
      setBidToWithdraw(null);
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
          </div>{" "}
          {/* close nav-links */}
        </div>{" "}
        {/* close container */}
      </nav>
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
                    <strong>Your Bid:</strong> $
                    {bid.finalContractPrice
                      ? Number(bid.finalContractPrice).toLocaleString()
                      : "-"}
                  </div>
                  <div className="detail-item">
                    <strong>Timeline:</strong>{" "}
                    {bid.completionDays ? bid.completionDays : "-"} days
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
                <Link to={`/bids/${bid.id}/edit`} className="btn btn-primary">
                  Edit Bid
                </Link>
                <button
                  onClick={() => handleDeleteBid(bid.id)}
                  className="btn btn-danger"
                >
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ConfirmModal is rendered below main content */}
      <ConfirmModal
        open={showWithdrawModal}
        message="Are you sure you want to withdraw this bid?"
        onConfirm={confirmWithdraw}
        onCancel={() => {
          setShowWithdrawModal(false);
          setBidToWithdraw(null);
        }}
        confirmText="Withdraw"
        cancelText="Cancel"
      />
    </div>
  );
}

export default Bids;
