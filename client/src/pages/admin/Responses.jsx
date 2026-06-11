import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/api";
import DataTable from "react-data-table-component";

const Responses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/responses");
        setResponses(res.data);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch responses", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/responses/${id}`);
          setResponses(responses.filter((res) => res._id !== id));
          Swal.fire("Deleted!", "Response deleted successfully.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete response", "error");
        }
      }
    });
  };

  const handleReplySubmit = async () => {
    if (reply.trim() === "") {
      setError("Reply cannot be empty!");
      return;
    }

    try {
      const res = await api.put(
        `/responses/${selectedResponse._id}/reply`,
        { reply }
      );
      setResponses((prev) =>
        prev.map((r) =>
          r._id === selectedResponse._id ? res.data : r
        )
      );
      Swal.fire("Success", "Reply added successfully!", "success");
      setReply("");
      setError("");
      setShowModal(false);
    } catch (error) {
      Swal.fire("Error", "Failed to send reply", "error");
    }
  };

  const handleSearch = (e) => setSearchText(e.target.value);

  const filteredResponses = responses.filter((r) =>
    r.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
    },
    {
      name: "Message",
      selector: (row) => row.message,
      wrap: true,
    },
    {
      name: "Reply",
      selector: (row) => row.reply || "-",
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex flex-nowrap">
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={() => {
              setSelectedResponse(row);
              setReply(row.reply || "");
              setShowModal(true);
              setError("");
            }}
            disabled={row.reply}
          >
            {row.reply ? "Replied" : "Reply"}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <div>
          <h1>Responses</h1>
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/admin">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Responses</li>
          </ol>
        </div>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search responses..."
          value={searchText}
          onChange={handleSearch}
        />
      </div>

      <div className="card-body">
        <DataTable
          columns={columns}
          data={filteredResponses}
          pagination
          highlightOnHover
          responsive
          progressPending={loading}
        />
      </div>

      {showModal && selectedResponse && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reply to Message</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Reply</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                ></textarea>
                {error && <div className="text-danger mt-1">{error}</div>}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button className="btn btn-primary" onClick={handleReplySubmit}>
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Responses;
