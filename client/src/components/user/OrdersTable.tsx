import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

interface OrdersTableProps {
  orders?: any[] | null;
  setOrders?: React.Dispatch<React.SetStateAction<any[] | null>>;
}

const OrdersTable = ({ orders, setOrders }: OrdersTableProps) => {
  const { user } = useAuth();
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(orders === undefined || orders === null);
  const navigate = useNavigate();

  const isControlled = orders !== undefined && setOrders !== undefined;
  const currentOrders = isControlled ? (orders || []) : localOrders;

  const updateOrdersState = (val: any[] | ((prev: any[]) => any[])) => {
    if (isControlled) {
      setOrders!(prev => {
        const base = prev || [];
        return typeof val === 'function' ? val(base) : val;
      });
    } else {
      setLocalOrders(prev => {
        return typeof val === 'function' ? val(prev) : val;
      });
    }
  };

  // Step 1: Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Step 2: Fetch orders once user is set
  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) return;
    if (isControlled && orders !== null) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/user/${userId}`);
        updateOrdersState(res.data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isControlled, orders]);

  return (
    <div>
      {loading ? (
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
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="text-start">
                  <div className="skeleton skeleton-text" style={{ width: '150px', height: '18px', marginBottom: '0' }}></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text" style={{ width: '80px', height: '18px', margin: 'auto' }}></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text" style={{ width: '70px', height: '18px', margin: 'auto' }}></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text" style={{ width: '50px', height: '18px', margin: 'auto' }}></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text" style={{ width: '60px', height: '18px', margin: 'auto' }}></div>
                </td>
                <td>
                  <div className="skeleton skeleton-button" style={{ width: '100px', height: '32px', margin: 'auto' }}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : currentOrders.length === 0 ? (
        <div className="empty-state-container my-5">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <h3 className="empty-state-title">No Orders Found</h3>
          <p className="empty-state-text">
            You haven't placed any orders yet. Visit our store and choose from our wide range of premium fresh groceries.
          </p>
          <Link to="/shop" className="btn btn-primary empty-state-btn">
            Shop Now
          </Link>
        </div>
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
            {currentOrders.map((order: any) => {
              const orderId = order.id || order._id;
              const shippingCharge = order.shippingCharge && typeof order.shippingCharge === 'object' && '$numberDecimal' in order.shippingCharge
                ? parseFloat(order.shippingCharge['$numberDecimal'])
                : parseFloat(order.shippingCharge || 0);
              const total = order.total && typeof order.total === 'object' && '$numberDecimal' in order.total
                ? parseFloat(order.total['$numberDecimal'])
                : parseFloat(order.total || 0);

              return (
                <tr key={orderId}>
                  <td className="text-start">{orderId}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>{order.orderStatus}</td>
                  <td>₹{shippingCharge.toFixed(2)}</td>
                  <td>₹{total.toFixed(2)}</td>
                  <td>
                    <Link className="btn btn-primary order-link" to={`/order/${orderId}`}>
                      View Order
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersTable;
