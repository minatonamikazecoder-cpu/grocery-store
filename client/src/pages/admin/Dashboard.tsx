import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBox, FaShoppingCart, FaUsers,FaThLarge  } from "react-icons/fa";
import OrderTable from "../../components/admin/OrderTable";
import api from "../../utils/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalActiveProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalActiveUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };

    fetchStats();
  }, []);

  const { totalActiveProducts, totalOrders, totalCategories, totalActiveUsers } = stats;

  return (
    <div>
      <h1 className="mt-4">Admin Dashboard</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item active">Dashboard</li>
      </ol>

      <div className="row">
        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/admin/products" className="text-decoration-none">
            <div className="card border-0 shadow-sm" style={{ background: '#f0fbf6', border: '1px solid #c3edd6', borderRadius: '12px' }}>
              <div className="card-body d-flex justify-content-between align-items-center py-4">
                <div>
                  <h6 className="text-muted fw-semibold mb-1 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Total Products</h6>
                  <h2 className="fw-bold mb-0" style={{ color: '#253d4e' }}>{totalActiveProducts}</h2>
                </div>
                <div style={{ background: '#3bb77e', color: '#fff', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaBox size={22} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/admin/orders" className="text-decoration-none">
            <div className="card border-0 shadow-sm" style={{ background: '#f0f4ff', border: '1px solid #c6d9ff', borderRadius: '12px' }}>
              <div className="card-body d-flex justify-content-between align-items-center py-4">
                <div>
                  <h6 className="text-muted fw-semibold mb-1 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Total Orders</h6>
                  <h2 className="fw-bold mb-0" style={{ color: '#253d4e' }}>{totalOrders}</h2>
                </div>
                <div style={{ background: '#3b7eff', color: '#fff', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaShoppingCart size={22} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/admin/categories" className="text-decoration-none">
            <div className="card border-0 shadow-sm" style={{ background: '#fff9e6', border: '1px solid #ffe8a3', borderRadius: '12px' }}>
              <div className="card-body d-flex justify-content-between align-items-center py-4">
                <div>
                  <h6 className="text-muted fw-semibold mb-1 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Total Categories</h6>
                  <h2 className="fw-bold mb-0" style={{ color: '#253d4e' }}>{totalCategories}</h2>
                </div>
                <div style={{ background: '#ffb300', color: '#fff', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaThLarge size={22} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/admin/users" className="text-decoration-none">
            <div className="card border-0 shadow-sm" style={{ background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '12px' }}>
              <div className="card-body d-flex justify-content-between align-items-center py-4">
                <div>
                  <h6 className="text-muted fw-semibold mb-1 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Total Active Users</h6>
                  <h2 className="fw-bold mb-0" style={{ color: '#253d4e' }}>{totalActiveUsers}</h2>
                </div>
                <div style={{ background: '#ff5c5c', color: '#fff', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaUsers size={22} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="card mb-4 p-2">
        <div className="card-header d-flex justify-content-between">
          <h4>Recent Orders</h4>
          <Link to="/admin/orders" className="btn btn-secondary">
            See All Orders
          </Link>
        </div>
        <OrderTable />
      </div>
    </div>
  );
};

export default Dashboard;
