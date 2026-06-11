import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const OrdersTable = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Step 1: Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Step 2: Fetch orders once user is set
  useEffect(() => {
    if (!user?._id) return;

    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/user/${user._id}`);
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?._id]);

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
