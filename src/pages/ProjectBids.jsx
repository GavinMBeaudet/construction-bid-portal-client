import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getProjectById,
  getBidsByProject,
  awardBid,
} from "../services/apiService";

function ProjectBids() {
  // State for owner acceptance info
  const [ownerSignature, setOwnerSignature] = useState("");
  const [ownerTitle, setOwnerTitle] = useState("");
  const [ownerDate, setOwnerDate] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("finalContractPrice");
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

  const confirmAward = async (acceptanceInfo) => {
    if (!awardingBid) return;
    setAwarding(true);
    setError("");
    try {
      const response = await awardBid(awardingBid.id, user.id, acceptanceInfo);
      console.log("Award Bid API response:", response);
      // Redirect to project details page after awarding
      navigate(`/projects/${id}`);
    } catch (err) {
      // Show a more descriptive error if project is not open
      if (err.message && err.message.includes("already been awarded")) {
        setError(
          "This project is already in progress or awarded. You cannot award another bid. Please check the project status."
        );
      } else {
        setError(err.message || "Failed to award bid");
      }
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
      switch (sortBy) {
        case "contractor":
          aValue = `${a.contractor?.firstName} ${a.contractor?.lastName}`;
          bValue = `${b.contractor?.firstName} ${b.contractor?.lastName}`;
          break;
        case "finalContractPrice":
          aValue = a.finalContractPrice;
          bValue = b.finalContractPrice;
          break;
        case "completionDays":
          aValue = a.completionDays;
          bValue = b.completionDays;
          break;
        case "ownerName":
          aValue = a.ownerName;
          bValue = b.ownerName;
          break;
        case "progressRetentionPercent":
          aValue = a.progressRetentionPercent;
          bValue = b.progressRetentionPercent;
          break;
        case "warrantyYears":
          aValue = a.warrantyYears;
          bValue = b.warrantyYears;
          break;
        case "dateSubmitted":
          aValue = new Date(a.dateSubmitted);
          bValue = new Date(b.dateSubmitted);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * multiplier;
      }
      return (aValue - bValue) * multiplier;
    });
  };
  const sortedBids = getSortedBids();

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

  const stats = {
    total: bids.length,
    avgAmount:
      bids.length > 0
        ? bids.reduce((sum, b) => sum + b.finalContractPrice, 0) / bids.length
        : 0,
    lowestAmount:
      bids.length > 0 ? Math.min(...bids.map((b) => b.finalContractPrice)) : 0,
    highestAmount:
      bids.length > 0 ? Math.max(...bids.map((b) => b.finalContractPrice)) : 0,
    avgTimeline: (() => {
      const validDays = bids
        .map((b) => Number(b.completionDays))
        .filter((val) => typeof val === "number" && !isNaN(val));
      return validDays.length > 0
        ? validDays.reduce((sum, val) => sum + val, 0) / validDays.length
        : 0;
    })(),
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
            <h3>{stats.avgTimeline ? Math.round(stats.avgTimeline) : 0}</h3>
            <p>Avg Timeline (days)</p>
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
                  <th onClick={() => handleSort("finalContractPrice")}>
                    Bid Amount{" "}
                    {sortBy === "finalContractPrice" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("completionDays")}>
                    Timeline{" "}
                    {sortBy === "completionDays" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("progressRetentionPercent")}>
                    Retention{" "}
                    {sortBy === "progressRetentionPercent" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("warrantyYears")}>
                    Warranty{" "}
                    {sortBy === "warrantyYears" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("dateSubmitted")}>
                    Date Submitted{" "}
                    {sortBy === "dateSubmitted" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedBids.map((bid) => {
                  const isLowest =
                    bid.finalContractPrice === stats.lowestAmount;
                  const isHighest =
                    bid.finalContractPrice === stats.highestAmount;
                  const isFastest =
                    bid.completionDays === stats.fastestTimeline;

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
                        <strong>
                          ${bid.finalContractPrice?.toLocaleString()}
                        </strong>
                        {isLowest && (
                          <span className="badge lowest">Lowest</span>
                        )}
                        {isHighest && (
                          <span className="badge highest">Highest</span>
                        )}
                      </td>
                      <td>
                        {bid.completionDays} days
                        {isFastest && (
                          <span className="badge fastest">Fastest</span>
                        )}
                      </td>
                      <td>{bid.progressRetentionPercent}%</td>
                      <td>{bid.warrantyYears} year(s)</td>
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
                <div
                  className="tennessee-bid-form-preview container"
                  style={{
                    maxWidth: 900,
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 2px 16px #0001",
                    padding: 32,
                  }}
                >
                  <h2
                    style={{
                      textAlign: "center",
                      color: "#6c2eb7",
                      marginBottom: 24,
                    }}
                  >
                    BID FORM FOR CONSTRUCTION OF BUILDING
                  </h2>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 16,
                      marginBottom: 24,
                    }}
                  >
                    <tbody>
                      <tr style={{ background: "#f3f3f3" }}>
                        <th
                          style={{
                            textAlign: "left",
                            padding: 8,
                            width: "50%",
                          }}
                        >
                          Contractor
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: 8,
                            width: "50%",
                          }}
                        >
                          Owner
                        </th>
                      </tr>
                      <tr>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.contractorName}
                        </td>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.ownerName}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.contractorAddress}
                        </td>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.ownerAddress}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.contractorCity},{" "}
                          {selectedProposal.contractorState}{" "}
                          {selectedProposal.contractorZip}
                        </td>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.ownerCity},{" "}
                          {selectedProposal.ownerState}{" "}
                          {selectedProposal.ownerZip}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 8 }}>
                          License: {selectedProposal.contractorLicense}
                        </td>
                        <td style={{ padding: 8 }}></td>
                      </tr>
                      <tr style={{ background: "#f3f3f3" }}>
                        <th style={{ padding: 8 }}>Lender</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.lenderName}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Project Number</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.projectNumber}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Project Address</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.projectAddress},{" "}
                          {selectedProposal.projectCity},{" "}
                          {selectedProposal.projectState}{" "}
                          {selectedProposal.projectZip}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Project Description</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.projectDescription}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Other Contract Documents</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.otherContractDocs}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Work Involved</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.workInvolved}
                        </td>
                      </tr>
                      <tr style={{ background: "#f3f3f3" }}>
                        <th style={{ padding: 8 }}>Commencement of Work</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.commencementType === "notice"
                            ? `Upon ${selectedProposal.commencementDays} days notice from Owner`
                            : selectedProposal.commencementType === "acceptance"
                            ? `Within ${selectedProposal.commencementDays} days of acceptance`
                            : `Other: ${selectedProposal.commencementOther}`}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Completion of Work</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.completionType === "days"
                            ? `Within ${selectedProposal.completionDays} days commencement of work`
                            : `Other: ${selectedProposal.completionOther}`}
                        </td>
                      </tr>
                      <tr style={{ background: "#f3f3f3" }}>
                        <th style={{ padding: 8 }}>Final Contract Price</th>
                        <td style={{ padding: 8 }}>
                          ${selectedProposal.finalContractPrice}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Progress Payment</th>
                        <td style={{ padding: 8 }}>
                          Less {selectedProposal.progressRetentionPercent}%
                          retention to be paid within{" "}
                          {selectedProposal.progressRetentionDays} days of
                          application of work completed
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Final Payment</th>
                        <td style={{ padding: 8 }}>
                          Including any retention to be paid within{" "}
                          {selectedProposal.finalPaymentDays} days of Notice of
                          Completion and Application for Final Payment
                        </td>
                      </tr>
                      <tr style={{ background: "#f3f3f3" }}>
                        <th style={{ padding: 8 }}>Termination of Proposal</th>
                        <td style={{ padding: 8 }}>
                          If not accepted before{" "}
                          {selectedProposal.terminationDate}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Date of Proposal</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.proposalDate}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Warranty Period</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.warrantyYears} years from completion
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: 8 }}>Additional Provisions</th>
                        <td style={{ padding: 8 }}>
                          {selectedProposal.additionalProvisions}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        background: "#f3f3f3",
                        padding: 8,
                        borderTop: "1px solid #ccc",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Proposal by Contractor
                    </div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: 16,
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={{ padding: 8, width: "40%" }}>
                            Signature
                          </th>
                          <th style={{ padding: 8, width: "30%" }}>Title</th>
                          <th style={{ padding: 8, width: "30%" }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedProposal.contractorSignatures || [])
                          .filter((sig) => sig.name && sig.title && sig.date)
                          .map((sig, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: 8 }}>{sig.name}</td>
                              <td style={{ padding: 8 }}>{sig.title}</td>
                              <td style={{ padding: 8 }}>{sig.date}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        background: "#f3f3f3",
                        padding: 8,
                        borderTop: "1px solid #ccc",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Acceptance by Owner
                    </div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: 16,
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={{ padding: 8, width: "40%" }}>
                            Signature
                          </th>
                          <th style={{ padding: 8, width: "30%" }}>Title</th>
                          <th style={{ padding: 8, width: "30%" }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedProposal.ownerSignatures || [])
                          .filter((sig) => sig.name && sig.title && sig.date)
                          .map((sig, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: 8 }}>{sig.name}</td>
                              <td style={{ padding: 8 }}>{sig.title}</td>
                              <td style={{ padding: 8 }}>{sig.date}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
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
              <div
                className="modal-header"
                style={{ borderBottom: "1px solid #eee", paddingBottom: 12 }}
              >
                <h2 style={{ margin: 0, fontWeight: 600, fontSize: 22 }}>
                  Owner Acceptance
                </h2>
                <button
                  className="modal-close"
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    fontSize: 24,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#888",
                  }}
                >
                  ×
                </button>
              </div>
              <div
                className="modal-body"
                style={{ padding: "1.5rem 1rem 1rem 1rem" }}
              >
                <div
                  className="award-warning"
                  style={{
                    marginBottom: "1.2rem",
                    background: "#f8f8fa",
                    borderRadius: 6,
                    padding: "0.75rem 1rem",
                    fontSize: 15,
                  }}
                >
                  <strong>Warning:</strong> Awarding this bid will:
                  <ul style={{ margin: "0.5rem 0 0 1.2rem", padding: 0 }}>
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
                <div
                  className="award-details"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label style={{ fontWeight: 500, marginBottom: 2 }}>
                      Owner Signature
                    </label>
                    <input
                      type="text"
                      value={ownerSignature}
                      onChange={(e) => setOwnerSignature(e.target.value)}
                      placeholder="Owner Name"
                      className="input"
                      style={{
                        padding: "0.5rem",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 15,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label style={{ fontWeight: 500, marginBottom: 2 }}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={ownerTitle}
                      onChange={(e) => setOwnerTitle(e.target.value)}
                      placeholder="Title"
                      className="input"
                      style={{
                        padding: "0.5rem",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 15,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label style={{ fontWeight: 500, marginBottom: 2 }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={ownerDate}
                      onChange={(e) => setOwnerDate(e.target.value)}
                      className="input"
                      style={{
                        padding: "0.5rem",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 15,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="modal-footer"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  borderTop: "1px solid #eee",
                  paddingTop: 16,
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setAwardingBid(null);
                  }}
                  style={{ minWidth: 100 }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    await confirmAward({
                      ownerSignatures: [
                        {
                          name: ownerSignature,
                          title: ownerTitle,
                          date: ownerDate,
                        },
                      ],
                    });
                    setShowConfirmModal(false);
                  }}
                  disabled={
                    awarding || !ownerSignature || !ownerTitle || !ownerDate
                  }
                  style={{ minWidth: 140 }}
                >
                  {awarding ? "Awarding..." : "Confirm & Sign"}
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
