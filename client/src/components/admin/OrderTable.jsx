import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [filterText, setFilterText] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/active");
      setOrders(response.data.orders);
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
      selector: row => row._id,
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: row => row.userId?.firstName + " " + row.userId?.lastName,
      cell: row => (
          <div>{row.userId?.firstName + " " + row.userId?.lastName}</div>
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
      selector: row => parseFloat(row.shippingCharge?.["$numberDecimal"] || 0).toFixed(2),
    },
    {
      name: "Total Price (₹)",
      selector: row => parseFloat(row.total?.["$numberDecimal"] || 0).toFixed(2),
    },
    {
      name: "Status",
      selector: row => row.orderStatus,
    },
    {
      name: "Actions",
      cell: row => (
        <div className="d-flex flex-nowrap">
          <Link className="btn btn-info btn-sm me-1" to={`/admin/view-order/${row._id}`}>View</Link>
          <Link className="btn btn-primary btn-sm me-1" to={`/admin/update-order/${row._id}`}>Edit</Link>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
        </div>
      ),
      width: "210px"
    },
  ];

  const filteredItems = orders.filter((item) =>
    Object.values({
      _id: item._id,
      firstName: item.userId?.firstName,
      lastName: item.userId?.lastName,
      orderDate: new Date(item.orderDate).toLocaleDateString(),
      shippingCharge: item.shippingCharge?.$numberDecimal,
      total: item.total?.$numberDecimal,
      orderStatus: item.orderStatus,
    })
      .join(" ")
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  

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
        noDataComponent="No orders found."
      />
    </div>
  );
};

export default OrderTable;
