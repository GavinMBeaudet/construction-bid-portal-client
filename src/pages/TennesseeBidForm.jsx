import React, { useState } from "react";
import { createBid } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

function TennesseeBidForm() {
  const [form, setForm] = useState({
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
    commencementType: "", // 'notice', 'acceptance', 'other'
    commencementDays: "",
    commencementOther: "",
    completionType: "", // 'days', 'other'
    completionDays: "",
    completionOther: "",
  finalContractPrice: "",
  completionDays: "",
  progressRetentionPercent: "",
  progressRetentionDays: "",
  finalPaymentDays: "",
  terminationDate: "",
  proposalDate: "",
  warrantyYears: "",
  additionalProvisions: "",
  contractorSignatures: [{ name: "", title: "", date: "" }],
  ownerSignatures: [{ name: "", title: "", date: "" }],
  });
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // For array fields (signatures)
  const handleSignatureChange = (type, idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].map((sig, i) =>
        i === idx ? { ...sig, [field]: value } : sig
      ),
    }));
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setPreview(true);
  };

  const handleEdit = () => {
    setPreview(false);
  };

  const { user } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const projectId = Number(params.get("projectId"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      // Filter out empty signature objects before sending
      const payload = {
        ...form,
        projectId,
        contractorId: user?.id,
        finalContractPrice: Number(form.finalContractPrice),
        completionDays: String(form.completionDays),
        commencementDays: String(form.commencementDays),
        progressRetentionPercent: String(form.progressRetentionPercent),
        progressRetentionDays: String(form.progressRetentionDays),
        finalPaymentDays: String(form.finalPaymentDays),
        warrantyYears: String(form.warrantyYears),
        contractorSignatures: form.contractorSignatures.filter(
          (sig) => sig.name && sig.title && sig.date
        ),
        ownerSignatures: form.ownerSignatures.filter(
          (sig) => sig.name && sig.title && sig.date
        ),
      };
      console.log("Bid payload:", payload);
      await createBid(payload);
      setSuccess(true);
      setPreview(false);
      // Optionally reset form or redirect
    } catch (err) {
      setError(err.message || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  if (preview) {
    return (
      <div className="tennessee-bid-form-preview container">
        <h1>Preview Tennessee Bid Form</h1>
        <div className="bid-form-table">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <th style={{ textAlign: "left" }}>Contractor</th>
                <th style={{ textAlign: "left" }}>Owner</th>
              </tr>
              <tr>
                <td>{form.contractorName}</td>
                <td>{form.ownerName}</td>
              </tr>
              <tr>
                <td>{form.contractorAddress}</td>
                <td>{form.ownerAddress}</td>
              </tr>
              <tr>
                <td>
                  {form.contractorCity}, {form.contractorState}{" "}
                  {form.contractorZip}
                </td>
                <td>
                  {form.ownerCity}, {form.ownerState} {form.ownerZip}
                </td>
              </tr>
              <tr>
                <td>License: {form.contractorLicense}</td>
                <td></td>
              </tr>
              <tr>
                <th>Lender</th>
                <td>{form.lenderName}</td>
              </tr>
              <tr>
                <th>Project Number</th>
                <td>{form.projectNumber}</td>
              </tr>
              <tr>
                <th>Project Address</th>
                <td>
                  {form.projectAddress}, {form.projectCity}, {form.projectState}{" "}
                  {form.projectZip}
                </td>
              </tr>
              <tr>
                <th>Project Description</th>
                <td colSpan={2}>{form.projectDescription}</td>
              </tr>
              <tr>
                <th>Other Contract Documents</th>
                <td colSpan={2}>{form.otherContractDocs}</td>
              </tr>
              <tr>
                <th>Work Involved</th>
                <td colSpan={2}>{form.workInvolved}</td>
              </tr>
              <tr>
                <th>Commencement of Work</th>
                <td colSpan={2}>
                  {form.commencementType === "notice"
                    ? `Upon ${form.commencementDays} days notice from Owner`
                    : form.commencementType === "acceptance"
                    ? `Within ${form.commencementDays} days of acceptance`
                    : `Other: ${form.commencementOther}`}
                </td>
              </tr>
              <tr>
                <th>Completion of Work</th>
                <td colSpan={2}>
                  {form.completionType === "days"
                    ? `Within ${form.completionDays} days commencement of work`
                    : `Other: ${form.completionOther}`}
                </td>
              </tr>
              <tr>
                <th>Final Contract Price</th>
                <td colSpan={2}>${form.finalContractPrice}</td>
              </tr>
              <tr>
                <th>Progress Payment</th>
                <td colSpan={2}>
                  Less {form.progressRetentionPercent}% retention to be paid
                  within {form.progressRetentionDays} days of application of
                  work completed
                </td>
              </tr>
              <tr>
                <th>Final Payment</th>
                <td colSpan={2}>
                  Including any retention to be paid within{" "}
                  {form.finalPaymentDays} days of Notice of Completion and
                  Application for Final Payment
                </td>
              </tr>
              <tr>
                <th>Termination of Proposal</th>
                <td colSpan={2}>
                  If not accepted before {form.terminationDate}
                </td>
              </tr>
              <tr>
                <th>Date of Proposal</th>
                <td colSpan={2}>{form.proposalDate}</td>
              </tr>
              <tr>
                <th>Warranty Period</th>
                <td colSpan={2}>{form.warrantyYears} years from completion</td>
              </tr>
              <tr>
                <th>Additional Provisions</th>
                <td colSpan={2}>{form.additionalProvisions}</td>
              </tr>
              <tr>
                <th>Proposal by Contractor</th>
                <td colSpan={2}>
                  {form.contractorSignatures
                    .filter((sig) => sig.name && sig.title && sig.date)
                    .map((sig, idx) => (
                      <div key={idx} style={{ marginBottom: "0.5rem" }}>
                        <strong>Signature:</strong> {sig.name},{" "}
                        <strong>Title:</strong> {sig.title},{" "}
                        <strong>Date:</strong> {sig.date}
                      </div>
                    ))}
                </td>
              </tr>
              <tr>
                <th>Acceptance by Owner</th>
                <td colSpan={2}>
                  {form.ownerSignatures
                    .filter((sig) => sig.name && sig.title && sig.date)
                    .map((sig, idx) => (
                      <div key={idx} style={{ marginBottom: "0.5rem" }}>
                        <strong>Signature:</strong> {sig.name},{" "}
                        <strong>Title:</strong> {sig.title},{" "}
                        <strong>Date:</strong> {sig.date}
                      </div>
                    ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">Bid submitted successfully!</div>
        )}
        <button className="btn btn-secondary" onClick={handleEdit}>
          Edit
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          Submit
        </button>
      </div>
    );
  }

  return (
    <div className="tennessee-bid-form container">
      <h1>Tennessee Official Bid Form</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">Bid submitted successfully!</div>
      )}
      <form>
        <fieldset>
          <legend>Contractor Information</legend>
          <input
            name="contractorName"
            value={form.contractorName}
            onChange={handleChange}
            placeholder="Contractor Name"
          />
          <input
            name="contractorAddress"
            value={form.contractorAddress}
            onChange={handleChange}
            placeholder="Address"
          />
          <input
            name="contractorCity"
            value={form.contractorCity}
            onChange={handleChange}
            placeholder="City"
          />
          <input
            name="contractorState"
            value={form.contractorState}
            onChange={handleChange}
            placeholder="State"
          />
          <input
            name="contractorZip"
            value={form.contractorZip}
            onChange={handleChange}
            placeholder="Zip"
          />
          <input
            name="contractorLicense"
            value={form.contractorLicense}
            onChange={handleChange}
            placeholder="License Number"
          />
        </fieldset>
        <fieldset>
          <legend>Owner Information</legend>
          <input
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            placeholder="Owner Name"
          />
          <input
            name="ownerAddress"
            value={form.ownerAddress}
            onChange={handleChange}
            placeholder="Address"
          />
          <input
            name="ownerCity"
            value={form.ownerCity}
            onChange={handleChange}
            placeholder="City"
          />
          <input
            name="ownerState"
            value={form.ownerState}
            onChange={handleChange}
            placeholder="State"
          />
          <input
            name="ownerZip"
            value={form.ownerZip}
            onChange={handleChange}
            placeholder="Zip"
          />
        </fieldset>
        <fieldset>
          <legend>Lender Information</legend>
          <input
            name="lenderName"
            value={form.lenderName}
            onChange={handleChange}
            placeholder="Lender Name"
          />
          <input
            name="lenderAddress"
            value={form.lenderAddress}
            onChange={handleChange}
            placeholder="Address"
          />
          <input
            name="lenderCity"
            value={form.lenderCity}
            onChange={handleChange}
            placeholder="City"
          />
          <input
            name="lenderState"
            value={form.lenderState}
            onChange={handleChange}
            placeholder="State"
          />
          <input
            name="lenderZip"
            value={form.lenderZip}
            onChange={handleChange}
            placeholder="Zip"
          />
        </fieldset>
        <fieldset>
          <legend>Project Information</legend>
          <input
            name="projectNumber"
            value={form.projectNumber}
            onChange={handleChange}
            placeholder="Project Number"
          />
          <input
            name="projectAddress"
            value={form.projectAddress}
            onChange={handleChange}
            placeholder="Address"
          />
          <input
            name="projectCity"
            value={form.projectCity}
            onChange={handleChange}
            placeholder="City"
          />
          <input
            name="projectState"
            value={form.projectState}
            onChange={handleChange}
            placeholder="State"
          />
          <input
            name="projectZip"
            value={form.projectZip}
            onChange={handleChange}
            placeholder="Zip"
          />
          <textarea
            name="projectDescription"
            value={form.projectDescription}
            onChange={handleChange}
            placeholder="Project Description"
          />
        </fieldset>
        <fieldset>
          <legend>Other Contract Documents</legend>
          <textarea
            name="otherContractDocs"
            value={form.otherContractDocs}
            onChange={handleChange}
            placeholder="Identify all plans, specifications, addendums, etc."
          />
        </fieldset>
        <fieldset>
          <legend>Work Involved</legend>
          <textarea
            name="workInvolved"
            value={form.workInvolved}
            onChange={handleChange}
            placeholder="Work Involved"
          />
        </fieldset>
        <fieldset>
          <legend>Commencement of Work</legend>
          <label>
            <input
              type="radio"
              name="commencementType"
              value="notice"
              checked={form.commencementType === "notice"}
              onChange={handleChange}
            />{" "}
            Upon{" "}
            <input
              name="commencementDays"
              value={form.commencementDays}
              onChange={handleChange}
              style={{ width: 40 }}
            />{" "}
            days notice from Owner
          </label>
          <label>
            <input
              type="radio"
              name="commencementType"
              value="acceptance"
              checked={form.commencementType === "acceptance"}
              onChange={handleChange}
            />{" "}
            Within{" "}
            <input
              name="commencementDays"
              value={form.commencementDays}
              onChange={handleChange}
              style={{ width: 40 }}
            />{" "}
            days of acceptance
          </label>
          <label>
            <input
              type="radio"
              name="commencementType"
              value="other"
              checked={form.commencementType === "other"}
              onChange={handleChange}
            />{" "}
            Other:{" "}
            <input
              name="commencementOther"
              value={form.commencementOther}
              onChange={handleChange}
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>Completion of Work</legend>
          <label>
            <input
              type="radio"
              name="completionType"
              value="days"
              checked={form.completionType === "days"}
              onChange={handleChange}
            />{" "}
            Within{" "}
            <input
              name="completionDays"
              value={form.completionDays}
              onChange={handleChange}
              style={{ width: 40 }}
            />{" "}
            days commencement of work
          </label>
          <label>
            <input
              type="radio"
              name="completionType"
              value="other"
              checked={form.completionType === "other"}
              onChange={handleChange}
            />{" "}
            Other:{" "}
            <input
              name="completionOther"
              value={form.completionOther}
              onChange={handleChange}
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>Final Contract Price</legend>
          <input
            type="number"
            name="finalContractPrice"
            value={form.finalContractPrice}
            onChange={handleChange}
            placeholder="Final Contract Price ($)"
          />
        </fieldset>
        <fieldset>
          <legend>Progress Payment</legend>
          <label>
            Less{" "}
            <input
              name="progressRetentionPercent"
              value={form.progressRetentionPercent}
              onChange={handleChange}
              style={{ width: 40 }}
            />
            % retention to be paid within{" "}
            <input
              name="progressRetentionDays"
              value={form.progressRetentionDays}
              onChange={handleChange}
              style={{ width: 40 }}
            />{" "}
            days of application of work completed
          </label>
        </fieldset>
        <fieldset>
          <legend>Final Payment</legend>
          <label>
            Including any retention to be paid within{" "}
            <input
              name="finalPaymentDays"
              value={form.finalPaymentDays}
              onChange={handleChange}
              style={{ width: 40 }}
            />{" "}
            days of Notice of Completion and Application for Final Payment
          </label>
        </fieldset>
        <fieldset>
          <legend>Termination of Proposal</legend>
          <input
            name="terminationDate"
            value={form.terminationDate}
            onChange={handleChange}
            placeholder="If not accepted before (date)"
          />
        </fieldset>
        <fieldset>
          <legend>Date of Proposal</legend>
          <input
            type="date"
            name="proposalDate"
            value={form.proposalDate}
            onChange={handleChange}
          />
        </fieldset>
        <fieldset>
          <legend>Warranty Period</legend>
          <input
            name="warrantyYears"
            value={form.warrantyYears}
            onChange={handleChange}
            placeholder="Years from completion"
          />
        </fieldset>
        <fieldset>
          <legend>Additional Provisions</legend>
          <textarea
            name="additionalProvisions"
            value={form.additionalProvisions}
            onChange={handleChange}
            placeholder="Additional Provisions"
          />
        </fieldset>
        <fieldset>
          <legend>Proposal by Contractor</legend>
          {form.contractorSignatures.map((sig, idx) => (
            <div key={idx} className="signature-row">
              <input
                placeholder="Signature Name"
                value={sig.name}
                onChange={(e) =>
                  handleSignatureChange(
                    "contractorSignatures",
                    idx,
                    "name",
                    e.target.value
                  )
                }
              />
              <input
                placeholder="Title"
                value={sig.title}
                onChange={(e) =>
                  handleSignatureChange(
                    "contractorSignatures",
                    idx,
                    "title",
                    e.target.value
                  )
                }
              />
              <input
                type="date"
                placeholder="Date"
                value={sig.date}
                onChange={(e) =>
                  handleSignatureChange(
                    "contractorSignatures",
                    idx,
                    "date",
                    e.target.value
                  )
                }
              />
            </div>
          ))}
        </fieldset>
        <fieldset>
          <legend>Acceptance by Owner</legend>
          {form.ownerSignatures.map((sig, idx) => (
            <div key={idx} className="signature-row">
              <input
                placeholder="Signature Name"
                value={sig.name}
                onChange={(e) =>
                  handleSignatureChange(
                    "ownerSignatures",
                    idx,
                    "name",
                    e.target.value
                  )
                }
              />
              <input
                placeholder="Title"
                value={sig.title}
                onChange={(e) =>
                  handleSignatureChange(
                    "ownerSignatures",
                    idx,
                    "title",
                    e.target.value
                  )
                }
              />
              <input
                type="date"
                placeholder="Date"
                value={sig.date}
                onChange={(e) =>
                  handleSignatureChange(
                    "ownerSignatures",
                    idx,
                    "date",
                    e.target.value
                  )
                }
              />
            </div>
          ))}
        </fieldset>
        <button className="btn btn-secondary" onClick={handlePreview}>
          Preview
        </button>
      </form>
    </div>
  );
}

export default TennesseeBidForm;
