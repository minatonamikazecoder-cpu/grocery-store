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
            <div className="card bg-primary text-white shadow">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5>Total Products</h5>
                  <h2>{totalActiveProducts}</h2>
                </div>
                <FaBox size={32} />
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/admin/orders" className="text-decoration-none">
            <div className="card bg-success text-white shadow">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5>Total Orders</h5>
                  <h2>{totalOrders}</h2>
                </div>
                <FaShoppingCart size={32} />
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/admin/categories" className="text-decoration-none">
            <div className="card bg-warning text-white shadow">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5>Total Categories</h5>
                  <h2>{totalCategories}</h2>
                </div>
                <FaThLarge size={32} />
              </div>
            </div>
          </Link>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Link to="/admin/users" className="text-decoration-none">
            <div className="card bg-danger text-white shadow">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5>Total Active Users</h5>
                  <h2>{totalActiveUsers}</h2>
                </div>
                <FaUsers size={32} />
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
