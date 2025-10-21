import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getBids, updateBid } from "../services/apiService";
import { BID_STATUS } from "../constants/status";

function EditBid() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bid, setBid] = useState(null);

  const [formData, setFormData] = useState({
    finalContractPrice: "",
    completionDays: "",
    proposal: "",
    contractorName: "",
    contractorAddress: "",
    contractorCity: "",
    contractorState: "",
    contractorZip: "",
    contractorLicense: "",
    ownerName: "",
    ownerAddress: "",
    ownerCity: "",
    ownerState: "",
    ownerZip: "",
    lenderName: "",
    lenderAddress: "",
    lenderCity: "",
    lenderState: "",
    lenderZip: "",
    projectNumber: "",
    projectAddress: "",
    projectCity: "",
    projectState: "",
    projectZip: "",
    projectDescription: "",
    otherContractDocs: "",
    workInvolved: "",
    commencementType: "",
    commencementDays: "",
    commencementOther: "",
    completionType: "",
    completionOther: "",
    progressRetentionPercent: "",
    progressRetentionDays: "",
    finalPaymentDays: "",
    terminationDate: "",
    proposalDate: "",
    warrantyYears: "",
    additionalProvisions: "",
    status: BID_STATUS.SUBMITTED,
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
        finalContractPrice: currentBid.finalContractPrice,
        completionDays: currentBid.completionDays,
        proposal: currentBid.proposal,
        contractorName: currentBid.contractorName,
        contractorAddress: currentBid.contractorAddress,
        contractorCity: currentBid.contractorCity,
        contractorState: currentBid.contractorState,
        contractorZip: currentBid.contractorZip,
        contractorLicense: currentBid.contractorLicense,
        ownerName: currentBid.ownerName,
        ownerAddress: currentBid.ownerAddress,
        ownerCity: currentBid.ownerCity,
        ownerState: currentBid.ownerState,
        ownerZip: currentBid.ownerZip,
        lenderName: currentBid.lenderName,
        lenderAddress: currentBid.lenderAddress,
        lenderCity: currentBid.lenderCity,
        lenderState: currentBid.lenderState,
        lenderZip: currentBid.lenderZip,
        projectNumber: currentBid.projectNumber,
        projectAddress: currentBid.projectAddress,
        projectCity: currentBid.projectCity,
        projectState: currentBid.projectState,
        projectZip: currentBid.projectZip,
        projectDescription: currentBid.projectDescription,
        otherContractDocs: currentBid.otherContractDocs,
        workInvolved: currentBid.workInvolved,
        commencementType: currentBid.commencementType,
        commencementDays: currentBid.commencementDays,
        commencementOther: currentBid.commencementOther,
        completionType: currentBid.completionType,
        completionOther: currentBid.completionOther,
        progressRetentionPercent: currentBid.progressRetentionPercent,
        progressRetentionDays: currentBid.progressRetentionDays,
        finalPaymentDays: currentBid.finalPaymentDays,
        terminationDate: currentBid.terminationDate,
        proposalDate: currentBid.proposalDate,
        warrantyYears: currentBid.warrantyYears,
        additionalProvisions: currentBid.additionalProvisions,
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
        finalContractPrice: parseFloat(formData.finalContractPrice),
        completionDays: formData.completionDays,
        proposal: formData.proposal,
        contractorName: formData.contractorName,
        contractorAddress: formData.contractorAddress,
        contractorCity: formData.contractorCity,
        contractorState: formData.contractorState,
        contractorZip: formData.contractorZip,
        contractorLicense: formData.contractorLicense,
        ownerName: formData.ownerName,
        ownerAddress: formData.ownerAddress,
        ownerCity: formData.ownerCity,
        ownerState: formData.ownerState,
        ownerZip: formData.ownerZip,
        lenderName: formData.lenderName,
        lenderAddress: formData.lenderAddress,
        lenderCity: formData.lenderCity,
        lenderState: formData.lenderState,
        lenderZip: formData.lenderZip,
        projectNumber: formData.projectNumber,
        projectAddress: formData.projectAddress,
        projectCity: formData.projectCity,
        projectState: formData.projectState,
        projectZip: formData.projectZip,
        projectDescription: formData.projectDescription,
        otherContractDocs: formData.otherContractDocs,
        workInvolved: formData.workInvolved,
        commencementType: formData.commencementType,
        commencementDays: formData.commencementDays,
        commencementOther: formData.commencementOther,
        completionType: formData.completionType,
        completionOther: formData.completionOther,
        progressRetentionPercent: formData.progressRetentionPercent,
        progressRetentionDays: formData.progressRetentionDays,
        finalPaymentDays: formData.finalPaymentDays,
        terminationDate: formData.terminationDate,
        proposalDate: formData.proposalDate,
        warrantyYears: formData.warrantyYears,
        additionalProvisions: formData.additionalProvisions,
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

          {bid.status === BID_STATUS.ACCEPTED ||
          bid.status === BID_STATUS.REJECTED ? (
            <div
              className="alert alert-warning"
              style={{ marginBottom: "2rem" }}
            >
              {bid.status === BID_STATUS.ACCEPTED
                ? "This bid has been accepted and can no longer be edited."
                : "This bid has been rejected and can no longer be edited."}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="finalContractPrice">
                  Final Contract Price ($)
                </label>
                <input
                  type="number"
                  id="finalContractPrice"
                  name="finalContractPrice"
                  value={formData.finalContractPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter your final contract price"
                />
              </div>
              <div className="form-group">
                <label htmlFor="completionDays">Completion (Days)</label>
                <input
                  type="number"
                  id="completionDays"
                  name="completionDays"
                  value={formData.completionDays}
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
                <label htmlFor="contractorName">Contractor Name</label>
                <input
                  type="text"
                  id="contractorName"
                  name="contractorName"
                  value={formData.contractorName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contractorAddress">Contractor Address</label>
                <input
                  type="text"
                  id="contractorAddress"
                  name="contractorAddress"
                  value={formData.contractorAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contractorCity">Contractor City</label>
                <input
                  type="text"
                  id="contractorCity"
                  name="contractorCity"
                  value={formData.contractorCity}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contractorState">Contractor State</label>
                <input
                  type="text"
                  id="contractorState"
                  name="contractorState"
                  value={formData.contractorState}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contractorZip">Contractor Zip</label>
                <input
                  type="text"
                  id="contractorZip"
                  name="contractorZip"
                  value={formData.contractorZip}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contractorLicense">Contractor License</label>
                <input
                  type="text"
                  id="contractorLicense"
                  name="contractorLicense"
                  value={formData.contractorLicense}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ownerName">Owner Name</label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ownerAddress">Owner Address</label>
                <input
                  type="text"
                  id="ownerAddress"
                  name="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ownerCity">Owner City</label>
                <input
                  type="text"
                  id="ownerCity"
                  name="ownerCity"
                  value={formData.ownerCity}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ownerState">Owner State</label>
                <input
                  type="text"
                  id="ownerState"
                  name="ownerState"
                  value={formData.ownerState}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ownerZip">Owner Zip</label>
                <input
                  type="text"
                  id="ownerZip"
                  name="ownerZip"
                  value={formData.ownerZip}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lenderName">Lender Name</label>
                <input
                  type="text"
                  id="lenderName"
                  name="lenderName"
                  value={formData.lenderName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lenderAddress">Lender Address</label>
                <input
                  type="text"
                  id="lenderAddress"
                  name="lenderAddress"
                  value={formData.lenderAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lenderCity">Lender City</label>
                <input
                  type="text"
                  id="lenderCity"
                  name="lenderCity"
                  value={formData.lenderCity}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lenderState">Lender State</label>
                <input
                  type="text"
                  id="lenderState"
                  name="lenderState"
                  value={formData.lenderState}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lenderZip">Lender Zip</label>
                <input
                  type="text"
                  id="lenderZip"
                  name="lenderZip"
                  value={formData.lenderZip}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectNumber">Project Number</label>
                <input
                  type="text"
                  id="projectNumber"
                  name="projectNumber"
                  value={formData.projectNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectAddress">Project Address</label>
                <input
                  type="text"
                  id="projectAddress"
                  name="projectAddress"
                  value={formData.projectAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectCity">Project City</label>
                <input
                  type="text"
                  id="projectCity"
                  name="projectCity"
                  value={formData.projectCity}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectState">Project State</label>
                <input
                  type="text"
                  id="projectState"
                  name="projectState"
                  value={formData.projectState}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectZip">Project Zip</label>
                <input
                  type="text"
                  id="projectZip"
                  name="projectZip"
                  value={formData.projectZip}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectDescription">Project Description</label>
                <input
                  type="text"
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="otherContractDocs">Other Contract Docs</label>
                <input
                  type="text"
                  id="otherContractDocs"
                  name="otherContractDocs"
                  value={formData.otherContractDocs}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="workInvolved">Work Involved</label>
                <input
                  type="text"
                  id="workInvolved"
                  name="workInvolved"
                  value={formData.workInvolved}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="commencementType">Commencement Type</label>
                <input
                  type="text"
                  id="commencementType"
                  name="commencementType"
                  value={formData.commencementType}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="commencementDays">Commencement Days</label>
                <input
                  type="text"
                  id="commencementDays"
                  name="commencementDays"
                  value={formData.commencementDays}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="commencementOther">Commencement Other</label>
                <input
                  type="text"
                  id="commencementOther"
                  name="commencementOther"
                  value={formData.commencementOther}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="completionType">Completion Type</label>
                <input
                  type="text"
                  id="completionType"
                  name="completionType"
                  value={formData.completionType}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="completionOther">Completion Other</label>
                <input
                  type="text"
                  id="completionOther"
                  name="completionOther"
                  value={formData.completionOther}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="progressRetentionPercent">
                  Progress Retention Percent
                </label>
                <input
                  type="text"
                  id="progressRetentionPercent"
                  name="progressRetentionPercent"
                  value={formData.progressRetentionPercent}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="progressRetentionDays">
                  Progress Retention Days
                </label>
                <input
                  type="text"
                  id="progressRetentionDays"
                  name="progressRetentionDays"
                  value={formData.progressRetentionDays}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="finalPaymentDays">Final Payment Days</label>
                <input
                  type="text"
                  id="finalPaymentDays"
                  name="finalPaymentDays"
                  value={formData.finalPaymentDays}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="terminationDate">Termination Date</label>
                <input
                  type="text"
                  id="terminationDate"
                  name="terminationDate"
                  value={formData.terminationDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="proposalDate">Proposal Date</label>
                <input
                  type="text"
                  id="proposalDate"
                  name="proposalDate"
                  value={formData.proposalDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="warrantyYears">Warranty Years</label>
                <input
                  type="text"
                  id="warrantyYears"
                  name="warrantyYears"
                  value={formData.warrantyYears}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="additionalProvisions">
                  Additional Provisions
                </label>
                <input
                  type="text"
                  id="additionalProvisions"
                  name="additionalProvisions"
                  value={formData.additionalProvisions}
                  onChange={handleChange}
                />
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
          )}
        </div>
      </main>
    </div>
  );
}

export default EditBid;
