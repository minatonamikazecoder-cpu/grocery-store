import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../utils/api";

const OrdersTable = () => {
  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Step 1: Get userId from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Step 2: Fetch orders once userId is set
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/user/${userId}`);
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return (
    <div>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="table cart-table text-nowrap">
          <thead>
            <tr className="heading text-center">
              <th className='text-start'>Order ID</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Shipping</th>
              <th>Total</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="text-start">{order._id}</td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td>{order.orderStatus}</td>
                <td>₹{parseFloat(order.shippingCharge["$numberDecimal"]).toFixed(2)}</td>
                <td>₹{parseFloat(order.total["$numberDecimal"]).toFixed(2)}</td>
                <td>
                  <Link className="primary-btn order-link" to={`/order/${order._id}`}>
                    View Order
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersTable;
