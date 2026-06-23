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

  const columns: any[] = [
    {
      name: "No.",
      selector: (row: any, index: any) => index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: any) => row.email,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row: any) => row.phone,
    },
    {
      name: "Message",
      selector: (row: any) => row.message,
      wrap: true,
    },
    {
      name: "Reply",
      selector: (row: any) => row.reply || "-",
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
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
          noDataComponent={
            <div className="empty-state-container w-100 py-4 my-2">
              <svg className="empty-state-icon" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-4.796a2 2 0 012.22 0l8 4.796A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5M12 14v-4"></path>
              </svg>
              <h5 className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Responses Found</h5>
              <p className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px', marginBottom: 0 }}>Customer queries and messages will appear here.</p>
            </div>
          }
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
                  rows={3}
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
