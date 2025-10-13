import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getProjectById,
  getBidsByProject,
  getBidsByContractor,
  createBid,
  deleteProject,
} from "../services/apiService";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [timelineInDays, setTimelineInDays] = useState("");
  const [proposal, setProposal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const projectData = await getProjectById(id);
      setProject(projectData);

      // Load bids based on user type
      if (user?.userType === "Owner" && user?.id === projectData.ownerId) {
        // Owner sees all bids for their project
        const bidsData = await getBidsByProject(id);
        setBids(bidsData);
      } else if (user?.userType === "Contractor") {
        // Contractor sees only their own bid for this project
        const allContractorBids = await getBidsByContractor(user.id);
        const myBidForThisProject = allContractorBids.filter(
          (b) => b.projectId === parseInt(id)
        );
        setBids(myBidForThisProject);
      }
    } catch (err) {
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createBid({
        projectId: parseInt(id),
        contractorId: user.id,
        bidAmount: parseFloat(bidAmount),
        timelineInDays: parseInt(timelineInDays),
        proposal,
      });

      alert("Bid submitted successfully!");
      navigate("/bids");
    } catch (err) {
      setError(err.message || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteProject(id, user.id);
      alert("Project deleted successfully!");
      navigate("/projects");
    } catch (err) {
      setError("Failed to delete project");
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  const isOwner = user?.userType === "Owner" && user?.id === project.ownerId;
  const isContractor = user?.userType === "Contractor";

  return (
    <div className="project-detail-page">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Construction Bid Portal</h1>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            {user?.userType === "Contractor" && <Link to="/bids">My Bids</Link>}
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="breadcrumb">
          <Link to="/projects">← Back to Projects</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="project-detail">
          <div className="project-header">
            <div>
              <h1>{project.title}</h1>
              <span
                className={`status-badge status-${project.status.toLowerCase()}`}
              >
                {project.status}
              </span>
            </div>
            {isOwner && (
              <div className="project-actions">
                <Link to={`/projects/${id}/edit`} className="btn btn-secondary">
                  Edit Project
                </Link>
                <button
                  onClick={handleDeleteProject}
                  className="btn btn-danger"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>

          <div className="project-info-grid">
            <div className="info-section">
              <h3>Project Details</h3>
              <dl>
                <dt>Location:</dt>
                <dd>{project.location}</dd>
                <dt>Budget:</dt>
                <dd>${project.budget.toLocaleString()}</dd>
                <dt>Bid Deadline:</dt>
                <dd>{new Date(project.bidDeadline).toLocaleDateString()}</dd>
                <dt>Status:</dt>
                <dd>{project.status}</dd>
                <dt>Posted:</dt>
                <dd>{new Date(project.dateCreated).toLocaleDateString()}</dd>
              </dl>
            </div>

            <div className="info-section">
              <h3>Description</h3>
              <p>{project.description}</p>
            </div>
          </div>

          {isContractor && bids.length === 0 && !showBidForm && (
            <div className="action-section">
              <button
                onClick={() => setShowBidForm(true)}
                className="btn btn-primary btn-large"
              >
                Submit a Bid for This Project
              </button>
            </div>
          )}

          {isContractor && bids.length > 0 && (
            <div className="bids-section">
              <h3>Your Bid</h3>
              <div className="bids-list">
                {bids.map((bid) => (
                  <div key={bid.id} className="bid-card my-bid">
                    <div className="bid-header">
                      <h4>Your Submitted Bid</h4>
                      <span className="bid-amount">
                        ${bid.bidAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="bid-proposal">{bid.proposal}</p>
                    <div className="bid-meta">
                      <span>Timeline: {bid.timelineInDays} days</span>
                      <span>
                        Submitted:{" "}
                        {new Date(bid.dateSubmitted).toLocaleDateString()}
                      </span>
                      <span
                        className={`status-badge status-${bid.status.toLowerCase()}`}
                      >
                        {bid.status}
                      </span>
                    </div>
                    <div className="bid-actions">
                      <Link
                        to={`/bids/${bid.id}/edit`}
                        className="btn btn-secondary"
                      >
                        Edit Bid
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isContractor && bids.length === 0 && showBidForm && (
            <div className="bid-form-section">
              <h3>Submit Your Bid</h3>
              <form onSubmit={handleSubmitBid}>
                <div className="form-group">
                  <label htmlFor="bidAmount">Bid Amount ($)</label>
                  <input
                    type="number"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
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
                    value={timelineInDays}
                    onChange={(e) => setTimelineInDays(e.target.value)}
                    required
                    min="1"
                    placeholder="Enter estimated days to complete"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="proposal">Proposal</label>
                  <textarea
                    id="proposal"
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    required
                    placeholder="Describe your approach, timeline, and qualifications..."
                    rows="6"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowBidForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Bid"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isOwner && (
            <div className="bids-section">
              <h3>Received Bids ({bids.length})</h3>
              {bids.length === 0 ? (
                <p className="empty-state">No bids received yet.</p>
              ) : (
                <div className="bids-list">
                  {bids.map((bid) => (
                    <div key={bid.id} className="bid-card">
                      <div className="bid-header">
                        <h4>
                          Contractor: {bid.contractor?.firstName}{" "}
                          {bid.contractor?.lastName}
                        </h4>
                        <span className="bid-amount">
                          ${bid.bidAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="bid-proposal">{bid.proposal}</p>
                      <div className="bid-meta">
                        <span>Timeline: {bid.timelineInDays} days</span>
                        <span>
                          Submitted:{" "}
                          {new Date(bid.dateSubmitted).toLocaleDateString()}
                        </span>
                        <span
                          className={`status-badge status-${bid.status.toLowerCase()}`}
                        >
                          {bid.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProjectDetail;
