import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { tableCustomStyles } from "../../utils/adminTableStyles";

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [filterText, setFilterText] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/active");
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = (orderId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.patch(`/orders/${orderId}/delete`);
          Swal.fire("Deleted!", "Order has been deleted.", "success");
          fetchOrders();
        } catch (error) {
          Swal.fire("Error", "Failed to delete order.", "error");
        }
      }
    });
  };

  const columns = [
    {
      name: "Order ID",
      selector: row => row._id || row.id,
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: row => (row.userId?.firstName || "") + " " + (row.userId?.lastName || ""),
      cell: row => (
          <div>{(row.userId?.firstName || "") + " " + (row.userId?.lastName || "")}</div>
      ),
      sortable: true,
    },
    
    {
      name: "Order Date",
      selector: row => new Date(row.orderDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Shipping (₹)",
      selector: row => {
        const val = row.shippingCharge?.$numberDecimal !== undefined ? row.shippingCharge.$numberDecimal : (row.shippingCharge || 0);
        return parseFloat(val).toFixed(2);
      },
    },
    {
      name: "Total Price (₹)",
      selector: row => {
        const val = row.total?.$numberDecimal !== undefined ? row.total.$numberDecimal : (row.total || 0);
        return parseFloat(val).toFixed(2);
      },
    },
    {
      name: "Status",
      selector: row => row.orderStatus,
    },
    {
      name: "Actions",
      cell: row => (
        <div className="d-flex flex-nowrap">
          <Link className="btn btn-info btn-sm me-1" to={`/admin/view-order/${row._id || row.id}`}>View</Link>
          <Link className="btn btn-primary btn-sm me-1" to={`/admin/update-order/${row._id || row.id}`}>Edit</Link>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id || row.id)}>Delete</button>
        </div>
      ),
      width: "210px"
    },
  ];

  const filteredItems = orders.filter((item) => {
    const shipping = item.shippingCharge?.$numberDecimal !== undefined ? item.shippingCharge.$numberDecimal : (item.shippingCharge || 0);
    const tot = item.total?.$numberDecimal !== undefined ? item.total.$numberDecimal : (item.total || 0);
    return Object.values({
      _id: item._id || item.id,
      firstName: item.userId?.firstName || "",
      lastName: item.userId?.lastName || "",
      orderDate: new Date(item.orderDate).toLocaleDateString(),
      shippingCharge: shipping,
      total: tot,
      orderStatus: item.orderStatus,
    })
      .join(" ")
      .toLowerCase()
      .includes(filterText.toLowerCase());
  });

  

  return (
    <div>
      

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search orders..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        pagination
        highlightOnHover
        striped
        responsive
        persistTableHead
        customStyles={tableCustomStyles}
        noDataComponent={
          <div className="empty-state-container w-100 py-4 my-2">
            <svg className="empty-state-icon" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <h5 className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Orders Found</h5>
            <p className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px', marginBottom: 0 }}>Customer order records will be displayed here.</p>
          </div>
        }
      />
    </div>
  );
};

export default OrderTable;
