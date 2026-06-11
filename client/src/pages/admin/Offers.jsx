import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/api";
import DataTable from "react-data-table-component";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/offers");
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      Swal.fire("Error", "Failed to load offers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/offers/${id}`);
          Swal.fire("Deleted!", "Offer has been deleted.", "success");
          fetchOffers(); // refresh the data
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Failed to delete offer", "error");
        }
      }
    });
  };

  const filteredOffers = offers.filter((offer) =>
    Object.values(offer)
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: "Offer Description",
      selector: (row) => row.offerDescription,
      sortable: true,
      wrap: true,
    },
    {
      name: "Offer Code",
      selector: (row) => row.offerCode,
      sortable: true,
    },
    {
      name: "Discount",
      selector: (row) => `${row.discount}%`,
    },
    {
      name: "Minimum Order",
      selector: (row) => `₹${parseFloat(row.minimumOrder).toFixed(2)}`,
    },
    {
      name: "Status",
      selector: (row) => {
        const now = new Date();
        const start = new Date(row.startDate);
        const end = new Date(row.endDate);
        return now >= start && now <= end ? "Active" : "Expired";
      },
      cell: (row) => {
        const now = new Date();
        const start = new Date(row.startDate);
        const end = new Date(row.endDate);
        const active = now >= start && now <= end;
        return (
          <span
            className={`badge ${active ? "bg-success" : "bg-danger"}`}
          >
            {active ? "Active" : "Expired"}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex flex-nowrap">
          <Link
            to={`/admin/update-offer/${row._id}`}
            className="btn btn-secondary btn-sm me-2"
          >
            Edit
          </Link>
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
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <div>
          <h1>Offers Management</h1>
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/admin">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Offers</li>
          </ol>
        </div>
        <Link to="/admin/add-offer" className="btn btn-primary">
          Add Offer
        </Link>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search offers..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="card-body">
        <DataTable
          columns={columns}
          data={filteredOffers}
          pagination
          highlightOnHover
          responsive
          progressPending={loading}
          noDataComponent="No offers found"
          customStyles={{
            headCells: {
              style: {
                fontSize: "16px",
                fontWeight: "bold",
              },
            },
            cells: {
              style: {
                fontSize: "14px",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Offers;
