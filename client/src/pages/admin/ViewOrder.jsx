import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../utils/api";

const ViewOrder = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${orderId}`);
                const { order, orderItems } = res.data;
                setOrder(order);
                setProducts(orderItems || []);
            } catch (error) {
                console.error("Failed to fetch order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();

    }, [orderId]);

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Order not found.</div>;

    // Safely parse decimal values
    const shippingCharge = parseFloat(order.shippingCharge?.$numberDecimal || 0);
    const total = parseFloat(order.total?.$numberDecimal || 0);
    let subtotal = total - shippingCharge;
    let actualTotal = 0;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
                <div>
                    <h1>View Order</h1>
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                        <li className="breadcrumb-item"><Link to="/admin/orders">Orders</Link></li>
                        <li className="breadcrumb-item active">View Order</li>
                    </ol>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header"><h5>Order Details</h5></div>
                <div className="card-body">
                    <p><strong>Order ID:</strong> {order._id}</p>
                    <p><strong>Status:</strong> {order.orderStatus}</p>
                    <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                    <p><strong>Payment Mode:</strong> {order.paymentMode}</p>
                    <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header"><h5>Shipping Address</h5></div>
                        <div className="card-body">
                            <p><strong>Name:</strong> {order.delAddressId.fullName}</p>
                            <p><strong>Address:</strong> {order.delAddressId.address}</p>
                            <p><strong>City:</strong> {order.delAddressId.city}</p>
                            <p><strong>State:</strong> {order.delAddressId.state}</p>
                            <p><strong>Zip Code:</strong> {order.delAddressId.pincode}</p>
                            <p><strong>Phone:</strong> {order.delAddressId.phone}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header"><h5>User Information</h5></div>
                        <div className="card-body">
                            <p><strong>Name:</strong> {order.userId.firstName} {order.userId.lastName}</p>
                            <p><strong>Email:</strong> {order.userId.email}</p>
                            <p><strong>Phone:</strong> {order.userId.mobile}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header"><h5>Ordered Items</h5></div>
                <div className="card-body">
                    <table className="table border">
                        <thead className="table-light">
                            <tr>
                                <th>Item Image</th>
                                <th>Item Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((item) => {
                                const price = parseFloat(item.price?.$numberDecimal || 0);
                                const totalItem = price * item.quantity;
                                actualTotal += totalItem;
                                return (
                                    <tr key={item.productId._id}>
                                        <td>
                                            <img
                                                src={item.productId.productImage}
                                                alt={item.productId.productName}
                                                width="50"
                                            />
                                        </td>
                                        <td>{item.productId.productName}</td>
                                        <td>₹{price.toFixed(2)}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{totalItem.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="4" className="text-end">Subtotal:</th>
                                <td>₹{(actualTotal).toFixed(2)}</td>
                            </tr>
                            {actualTotal+shippingCharge-total  > 0 && (
                                <tr className="discount-summary text-danger">
                                    <th colSpan="4" className="text-end">Total Discount:</th>
                                    <td>-₹{(actualTotal+shippingCharge-total).toFixed(2)}</td>
                                </tr>
                            )}
                            <tr>
                                <th colSpan="4" className="text-end">Shipping Charge:</th>
                                <td>₹{shippingCharge.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <th colSpan="4" className="text-end">Total:</th>
                                <td>₹{total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewOrder;
