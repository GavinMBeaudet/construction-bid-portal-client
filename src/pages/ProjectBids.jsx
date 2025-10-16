import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getProjectById,
  getBidsByProject,
  awardBid,
} from "../services/apiService";

function ProjectBids() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("bidAmount");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [awardingBid, setAwardingBid] = useState(null);
  const [awarding, setAwarding] = useState(false);
  // Step 1: Add state for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadProjectAndBids();
  }, [id]);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount}`;
  };

  const loadProjectAndBids = async () => {
    try {
      setLoading(true);
      const projectData = await getProjectById(id);
      const bidsData = await getBidsByProject(id);

      // Check if user is the owner
      if (user?.userType !== "Owner" || user?.id !== projectData.ownerId) {
        setError("You do not have permission to view this page");
        return;
      }

      setProject(projectData);
      setBids(bidsData);
    } catch (err) {
      setError("Failed to load project and bids");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Award modal handlers
  const handleAwardBid = (bid) => {
    setAwardingBid(bid);
    setError("");
  };

  const confirmAward = async () => {
    if (!awardingBid) return;
    setAwarding(true);
    setError("");
    try {
      const response = await awardBid(awardingBid.id, user.id);
      console.log("Award Bid API response:", response);
      // Refresh project and bids after awarding
      await loadProjectAndBids();
      setAwardingBid(null);
      // Optionally show a toast or success message here
    } catch (err) {
      setError(err.message || "Failed to award bid");
    } finally {
      setAwarding(false);
    }
  };

  const cancelAward = () => {
    setAwardingBid(null);
    setError("");
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortedBids = () => {
    return [...bids].sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "contractor") {
        aValue = `${a.contractor?.firstName} ${a.contractor?.lastName}`;
        bValue = `${b.contractor?.firstName} ${b.contractor?.lastName}`;
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (sortBy === "dateSubmitted") {
        aValue = new Date(a.dateSubmitted);
        bValue = new Date(b.dateSubmitted);
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }

      const multiplier = sortOrder === "asc" ? 1 : -1;
      return (aValue - bValue) * multiplier;
    });
  };

  const handleLogout = () => {
    logout();
  };

  const showProposalModal = (bid) => {
    setSelectedProposal(bid);
  };

  const closeProposalModal = () => {
    setSelectedProposal(null);
  };

  if (loading) {
    return <div className="loading">Loading bid comparison...</div>;
  }

  if (error) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <div className="container">
            <h1 className="logo">Construction Bid Portal</h1>
            <div className="nav-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/projects">Projects</Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </nav>
        <main className="container">
          <div className="alert alert-error">{error}</div>
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  const sortedBids = getSortedBids();

  const stats = {
    total: bids.length,
    avgAmount:
      bids.length > 0
        ? bids.reduce((sum, b) => sum + b.bidAmount, 0) / bids.length
        : 0,
    lowestAmount:
      bids.length > 0 ? Math.min(...bids.map((b) => b.bidAmount)) : 0,
    highestAmount:
      bids.length > 0 ? Math.max(...bids.map((b) => b.bidAmount)) : 0,
    avgTimeline:
      bids.length > 0
        ? bids.reduce((sum, b) => sum + b.timelineInDays, 0) / bids.length
        : 0,
    fastestTimeline:
      bids.length > 0 ? Math.min(...bids.map((b) => b.timelineInDays)) : 0,
  };

  return (
    <div className="project-bids-page">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Construction Bid Portal</h1>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link> →{" "}
          <Link to={`/projects/${id}`}>{project.title}</Link> → Bid Comparison
        </div>

        <div className="page-header">
          <div>
            <h1>Bid Comparison: {project.title}</h1>
            <p className="subtitle">
              Compare all received bids and make an informed decision
            </p>
          </div>
          <Link to={`/projects/${id}`} className="btn btn-secondary">
            Back to Project
          </Link>
        </div>

        {/* Statistics Summary */}
        <div className="bid-statistics">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Bids</p>
          </div>
          <div className="stat-card">
            <h3>{formatCurrency(Math.round(stats.avgAmount))}</h3>
            <p>Average Bid</p>
          </div>
          <div className="stat-card">
            <h3>{formatCurrency(stats.lowestAmount)}</h3>
            <p>Lowest Bid</p>
          </div>
          <div className="stat-card">
            <h3>{formatCurrency(stats.highestAmount)}</h3>
            <p>Highest Bid</p>
          </div>
          <div className="stat-card">
            <h3>{Math.round(stats.avgTimeline)}</h3>
            <p>Avg Timeline (days)</p>
          </div>
          <div className="stat-card">
            <h3>{stats.fastestTimeline}</h3>
            <p>Fastest Timeline (days)</p>
          </div>
        </div>

        {/* Comparison Table */}
        {bids.length === 0 ? (
          <div className="empty-state">
            <p>No bids have been submitted for this project yet.</p>
            <Link to="/dashboard" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="bids-comparison-table">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("contractor")}>
                    Contractor{" "}
                    {sortBy === "contractor" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("bidAmount")}>
                    Bid Amount{" "}
                    {sortBy === "bidAmount" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("timelineInDays")}>
                    Timeline{" "}
                    {sortBy === "timelineInDays" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("dateSubmitted")}>
                    Date Submitted{" "}
                    {sortBy === "dateSubmitted" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedBids.map((bid) => {
                  const isLowest = bid.bidAmount === stats.lowestAmount;
                  const isHighest = bid.bidAmount === stats.highestAmount;
                  const isFastest =
                    bid.timelineInDays === stats.fastestTimeline;

                  return (
                    <tr
                      key={bid.id}
                      className={
                        isLowest ? "lowest-bid" : isHighest ? "highest-bid" : ""
                      }
                    >
                      <td>
                        <strong>
                          {bid.contractor?.firstName} {bid.contractor?.lastName}
                        </strong>
                        <br />
                        <small style={{ color: "#7f8c8d" }}>
                          {bid.contractor?.email}
                        </small>
                      </td>
                      <td className="bid-amount">
                        <strong>${bid.bidAmount.toLocaleString()}</strong>
                        {isLowest && (
                          <span className="badge lowest">Lowest</span>
                        )}
                        {isHighest && (
                          <span className="badge highest">Highest</span>
                        )}
                      </td>
                      <td>
                        {bid.timelineInDays} days
                        {isFastest && (
                          <span className="badge fastest">Fastest</span>
                        )}
                      </td>
                      <td>
                        {new Date(bid.dateSubmitted).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${bid.status.toLowerCase()}`}
                        >
                          {bid.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-link"
                          onClick={() => showProposalModal(bid)}
                        >
                          Award
                        </button>
                      </td>
                      <td></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Proposal Modal */}
        {selectedProposal && (
          <div className="modal-overlay" onClick={closeProposalModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Bid Proposal</h2>
                <button className="modal-close" onClick={closeProposalModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="proposal-details">
                  <h3>
                    {selectedProposal.contractor?.firstName}{" "}
                    {selectedProposal.contractor?.lastName}
                  </h3>
                  <div className="proposal-meta">
                    <span>
                      <strong>Bid Amount:</strong> $
                      {selectedProposal.bidAmount.toLocaleString()}
                    </span>
                    <span>
                      <strong>Timeline:</strong>{" "}
                      {selectedProposal.timelineInDays} days
                    </span>
                  </div>
                  <div className="proposal-text">
                    <h4>Proposal:</h4>
                    <p>{selectedProposal.proposal}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeProposalModal}
                >
                  Close
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setAwardingBid(selectedProposal);
                    setShowConfirmModal(true);
                  }}
                >
                  Award This Bid
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Awarding Bid */}
        {showConfirmModal && awardingBid && (
          <div
            className="modal-overlay"
            onClick={() => setShowConfirmModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Confirm Award</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowConfirmModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div
                  className="award-warning"
                  style={{ marginBottom: "1.2rem" }}
                >
                  <strong>Warning:</strong> Awarding this bid will:
                  <ul>
                    <li>
                      Set this bid as <b>Accepted</b> and notify the contractor
                    </li>
                    <li>
                      Mark the project as <b>Awarded</b>
                    </li>
                    <li>Reject all other bids for this project</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setAwardingBid(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    await confirmAward();
                    setShowConfirmModal(false);
                  }}
                  disabled={awarding}
                >
                  {awarding ? "Awarding..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProjectBids;
