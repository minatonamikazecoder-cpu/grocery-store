import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import api from "../../utils/api";

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
      setReviews(res.data);
      setFilteredReviews(res.data);
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

  const columns = [
     {
      name: "Product ID",
      selector: (row) => row.productId._id,
    },
        {
          name: "Product",
          selector: (row) => row.productId?.productName,
          sortable: true,
          cell: (row) => (
            <div className="d-flex align-items-center">
              <img
                src={row.productId?.productImage || "https://via.placeholder.com/50"} // fallback
                alt={row.productId?.productName}
                style={{ width: 50, height: 50, objectFit: "cover", marginRight: 10 }}
              />
                {row.productId?.productName}
            </div>
          ),
        },
        {
          name: "Username",
          selector: (row) =>
            `${row.userId?.firstName || ""} ${row.userId?.lastName || ""}`,
          sortable: true,
          cell: (row) => (
            <div>
              {row.userId?.firstName} {row.userId?.lastName}
              </div>
          ),
        },      
    {
      name: "Rating",
      selector: (row) => row.rating,
      sortable: true,
      cell: (row) => (
        <span className="text-warning">
          {Array.from({ length: 5 }, (_, i) => (i < row.rating ? "★" : "☆"))}
        </span>
      ),
    },
    {
      name: "Review",
      selector: (row) => row.review,
    },
    {
      name: "Reply",
      selector: (row) => row.reply || "-",
    },
    {
      name: "Actions",
      cell: (row) => (
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
      />

      {/* Reply Modal */}
      <div
        className="modal fade"
        id="replyModal"
        tabIndex="-1"
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
                rows="3"
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
