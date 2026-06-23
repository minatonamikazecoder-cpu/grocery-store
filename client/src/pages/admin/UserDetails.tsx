import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";

interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string | null;
  status: string;
}

interface OrderType {
  id: string;
  orderDate: string;
  totalQuantity: number;
  totalPrice: number;
  orderStatus: string;
}

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, ordersRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/orders/user/${id}`)
      ]);
      setUser(userRes.data);
      setOrders(ordersRes.data?.orders || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load user details or orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = (newStatus: string) => {
    const isActivating = newStatus === "Active";
    Swal.fire({
      title: isActivating ? "Activate Account?" : "Deactivate Account?",
      text: isActivating
        ? "Are you sure you want to activate this account?"
        : "Are you sure you want to deactivate this account? The user will not be able to log in.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActivating ? "#28a745" : "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isActivating ? "Activate" : "Deactivate",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/users/${id}`, { status: newStatus });
          setUser((prev) => (prev ? { ...prev, status: newStatus } : null));
          Swal.fire(
            isActivating ? "Activated!" : "Deactivated!",
            `The account status has been updated to ${newStatus}.`,
            "success"
          );
        } catch (err) {
          Swal.fire("Error", "Failed to update account status.", "error");
        }
      }
    });
  };

  const handleOrderDelete = (orderId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this order? This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.patch(`/orders/${orderId}/delete`);
          setOrders(orders.filter((order) => order.id !== orderId));
          Swal.fire("Deleted!", "Order has been removed.", "success");
        } catch (err) {
          Swal.fire("Error", "Failed to delete order.", "error");
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || "User not found"}</div>
        <Link to="/admin/users" className="btn btn-primary">Back to Users</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mt-4">User Details</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
        <li className="breadcrumb-item"><Link to="/admin/users">Users</Link></li>
        <li className="breadcrumb-item active">User Details</li>
      </ol>

      <div className="card mb-4">
        <div className="card-header">
          <h4>User Information</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <p><strong>First Name:</strong> {user.firstName}</p>
              <p><strong>Last Name:</strong> {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
            <div className="col-md-6 mb-3">
              <p><strong>Phone Number:</strong> {user.mobile || "Not provided"}</p>
              <p>
                <strong>Status: </strong>
                <span className={`badge ${user.status === "Active" ? "bg-success" : "bg-danger"}`}>
                  {user.status}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-2">
            <Link className="btn btn-primary me-2" to={`/admin/update-user/${user.id}`}>
              Edit User Info
            </Link>
            {user.status === "Active" ? (
              <button className="btn btn-danger" onClick={() => handleStatusChange("Inactive")}>
                Deactivate Account
              </button>
            ) : (
              <button className="btn btn-success" onClick={() => handleStatusChange("Active")}>
                Activate Account
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h4>User Orders</h4>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table border text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>{order.totalQuantity}</td>
                      <td>₹{Number(order.totalPrice).toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-secondary`}>{order.orderStatus}</span>
                      </td>
                      <td>
                        <Link to={`/admin/view-order/${order.id}`} className="btn btn-info btn-sm me-1">
                          View
                        </Link>
                        <Link to={`/admin/update-order/${order.id}`} className="btn btn-primary btn-sm me-1">
                          Edit
                        </Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleOrderDelete(order.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
