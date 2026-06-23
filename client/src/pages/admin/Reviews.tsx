import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import api from "../../utils/api";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setReviews(data);
      setFilteredReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    const result = reviews.filter(
      (item) =>
        item.productName?.toLowerCase().includes(search?.toLowerCase()) ||
        item.userName?.toLowerCase().includes(search?.toLowerCase()) ||
        item.review?.toLowerCase().includes(search?.toLowerCase())
    );
    setFilteredReviews(result);
  }, [search, reviews]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/reviews/${id}`);
        fetchReviews();
        Swal.fire("Deleted!", "Review has been deleted.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not delete review.", "error");
      }
    }
  };

  const handleReplySubmit = async () => {
    if (reply.trim() === "") {
      setError("Reply cannot be empty!");
      return;
    }

    try {
      await api.put(`/reviews/${selectedReview._id}/reply`, {
        reply,
      });

      setReply("");
      setError("");
      setSelectedReview(null);
      fetchReviews();

      Swal.fire(
        "Success",
        selectedReview.reply ? "Reply updated!" : "Reply added!",
        "success"
      );
    } catch (err) {
      console.error("Reply update error:", err);
      Swal.fire("Error", "Could not update reply.", "error");
    }
  };

  const columns: any[] = [
     {
      name: "Product ID",
      selector: (row: any) => row.productId._id,
    },
        {
          name: "Product",
          selector: (row: any) => row.productId?.productName,
          sortable: true,
          cell: (row: any) => (
            <div className="d-flex align-items-center">
              <img
                src={row.productId?.productImage || PLACEHOLDER_IMAGE}
                alt={row.productId?.productName}
                style={{ width: 50, height: 50, objectFit: "cover", marginRight: 10 }}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />
                {row.productId?.productName}
            </div>
          ),
        },
        {
          name: "Username",
          selector: (row: any) =>
            `${row.userId?.firstName || ""} ${row.userId?.lastName || ""}`,
          sortable: true,
          cell: (row: any) => (
            <div>
              {row.userId?.firstName} {row.userId?.lastName}
              </div>
          ),
        },      
    {
      name: "Rating",
      selector: (row: any) => row.rating,
      sortable: true,
      cell: (row: any) => (
        <span className="text-warning">
          {Array.from({ length: 5 }, (_, i) => (i < row.rating ? "★" : "☆"))}
        </span>
      ),
    },
    {
      name: "Review",
      selector: (row: any) => row.review,
    },
    {
      name: "Reply",
      selector: (row: any) => row.reply || "-",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <div className="d-flex flex-nowrap gap-1">
          <button
            className="btn btn-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#replyModal"
            onClick={() => {
              setSelectedReview(row);
              setReply(row.reply || "");
              setError("");
            }}
          >
            {row.reply ? "Update Reply" : "Reply"}
          </button>
          <Link to={`/admin/update-review/${row._id}`} className="btn btn-info btn-sm">
            Update
          </Link>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)}>
            Delete
          </button>
        </div>
      ),
      width:"270px"
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <div>
          <h1>Review Management</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item">
              <Link to="/admin">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Reviews</li>
          </ol>
        </div>
        <Link to="/admin/add-review" className="btn btn-primary">
          Add Review
        </Link>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search reviews..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredReviews}
        pagination
        highlightOnHover
        responsive
        striped
        noDataComponent={
          <div className="empty-state-container w-100 py-4 my-2">
            <svg className="empty-state-icon" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
            <h5 className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Reviews Found</h5>
            <p className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px', marginBottom: 0 }}>Product reviews submitted by customers will be shown here.</p>
          </div>
        }
      />

      {/* Reply Modal */}
      <div
        className="modal fade"
        id="replyModal"
        tabIndex={-1}
        aria-labelledby="replyModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedReview?.reply ? "Update Reply" : "Reply to Review"}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <textarea
                className="form-control"
                rows={3}
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  setError("");
                }}
              ></textarea>
              {error && <div className="text-danger mt-1">{error}</div>}
              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={handleReplySubmit}
              >
                {selectedReview?.reply ? "Update Reply" : "Add Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
