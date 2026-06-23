import React from "react";
import { Link } from "react-router-dom";
import OrderTable from "../../components/admin/OrderTable";

const Orders = () => {
  return (
    <div>
        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <div>
            <h1>Order Management</h1>
            <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
                <Link to="/admin">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Orders</li>
            </ol>
        </div>
        <Link className="btn btn-primary text-nowrap" to="/admin/add-order">
            Add Order
        </Link>
        </div>
        <OrderTable />
    </div>
  );
};


export default Orders;
