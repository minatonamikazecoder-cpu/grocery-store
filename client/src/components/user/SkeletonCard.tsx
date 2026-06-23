import React from "react";

const SkeletonCard: React.FC = () => {
  return (
    <div className="col-lg-3 col-md-4 col-6 gap p-2 mt-2">
      <div className="skeleton-card">
        <div className="skeleton skeleton-img"></div>
        <div className="skeleton-card-body">
          <div>
            <div className="skeleton skeleton-text short" style={{ height: "12px", width: "40%" }}></div>
            <div className="skeleton skeleton-text title" style={{ height: "18px", width: "85%", marginTop: "8px" }}></div>
            <div className="skeleton skeleton-text" style={{ height: "12px", width: "60%", marginTop: "8px" }}></div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="skeleton skeleton-text" style={{ height: "16px", width: "35%", marginBottom: "0" }}></div>
            <div className="skeleton skeleton-button" style={{ width: "60px", height: "32px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
