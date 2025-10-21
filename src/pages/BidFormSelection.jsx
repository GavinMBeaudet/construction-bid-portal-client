import React from "react";
import { useNavigate } from "react-router-dom";

function BidFormSelection() {
  const navigate = useNavigate();

  // For now, only TN is available
  const handleSelect = (form) => {
    if (form === "TN") {
      navigate("/bids/new/tennessee");
    }
  };

  return (
    <div className="bid-form-selection container">
      <h1>Select Bid Form</h1>
      <div className="form-options">
        <button className="btn btn-primary" onClick={() => handleSelect("TN")}>
          Tennessee Official Bid Form
        </button>
        {/* Future: Add NC or other forms here */}
      </div>
    </div>
  );
}

export default BidFormSelection;
