import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getBids, updateBid } from "../services/apiService";

function EditBid() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bid, setBid] = useState(null);

  const [formData, setFormData] = useState({
    bidAmount: "",
    timelineInDays: "",
    proposal: "",
    status: "Submitted",
  });

  useEffect(() => {
    loadBid();
  }, [id]);

  const loadBid = async () => {
    try {
      setLoading(true);
      // Get all bids and find the one we're editing
      const bids = await getBids();
      const currentBid = bids.find((b) => b.id === parseInt(id));

      if (!currentBid) {
        setError("Bid not found");
        return;
      }

      // Check if user is the contractor who made this bid
      if (user?.id !== currentBid.contractorId) {
        setError("You don't have permission to edit this bid");
        return;
      }

      setBid(currentBid);
      setFormData({
        bidAmount: currentBid.bidAmount,
        timelineInDays: currentBid.timelineInDays,
        proposal: currentBid.proposal,
        status: currentBid.status,
      });
    } catch (err) {
      setError("Failed to load bid");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await updateBid(id, {
        id: parseInt(id),
        projectId: bid.projectId,
        contractorId: user.id,
        bidAmount: parseFloat(formData.bidAmount),
        timelineInDays: parseInt(formData.timelineInDays),
        proposal: formData.proposal,
        status: formData.status,
        dateSubmitted: bid.dateSubmitted,
      });

      alert("Bid updated successfully!");
      navigate("/bids");
    } catch (err) {
      setError("Failed to update bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="loading">Loading bid...</div>;
  }

  if (!bid) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || "Bid not found"}</div>
        <Link to="/bids" className="btn btn-primary">
          Back to My Bids
        </Link>
      </div>
    );
  }

  return (
    <div className="edit-bid-page">
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
        <div className="breadcrumb">
          <Link to="/bids">← Back to My Bids</Link>
        </div>

        <div className="form-container">
          <h1>Edit Bid</h1>
          <p className="subtitle">Project: {bid.project?.title}</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bidAmount">Bid Amount ($)</label>
              <input
                type="number"
                id="bidAmount"
                name="bidAmount"
                value={formData.bidAmount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter your bid amount"
              />
            </div>

            <div className="form-group">
              <label htmlFor="timelineInDays">Timeline (Days)</label>
              <input
                type="number"
                id="timelineInDays"
                name="timelineInDays"
                value={formData.timelineInDays}
                onChange={handleChange}
                required
                min="1"
                placeholder="Enter estimated days to complete"
              />
            </div>

            <div className="form-group">
              <label htmlFor="proposal">Proposal</label>
              <textarea
                id="proposal"
                name="proposal"
                value={formData.proposal}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Describe your approach, timeline, and qualifications..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Submitted">Submitted</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="form-actions">
              <Link to="/bids" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Bid"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditBid;
