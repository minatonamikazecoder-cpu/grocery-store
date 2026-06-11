import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

const OrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async () => {
        try {
            const res = await api.get(`/orders/${orderId}`);
            const data = res.data;

            const {
                order,
                orderItems: orderedProducts // assumes API sends this
            } = data;

            setOrder(order);
            setProducts(orderedProducts || []);
        } catch (error) {
            console.error("Failed to fetch order:", error);
            toast.error("Failed to load order details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
        
    }, [orderId]);

    const handleReorder = () => {
        toast.success("Re-order placed successfully!");
    };

    if (loading) return <div className="text-center my-5">Loading...</div>;
    if (!order) return <div className="text-center my-5">Order not found.</div>;

    const customer = order.userId;
    const address = order.delAddressId;
const subtotalFromProducts = products.reduce((acc, product) => {
    const price = parseFloat(product.price["$numberDecimal"]);
    return acc + price * product.quantity;
}, 0);

const orderTotal = parseFloat(order.total["$numberDecimal"]);
const shippingCharge = parseFloat(order.shippingCharge["$numberDecimal"]);
const actualSubtotal = orderTotal - shippingCharge;

const discount = subtotalFromProducts - actualSubtotal;

    return (
        <div className="container sitemap">
            <p className="my-5">
                <Link to="/" className="text-decoration-none dim link">Home /</Link>
                <Link to="/order-history" className="text-decoration-none dim link">Orders /</Link>
                Order# {order._id}
            </p>

            <div className="row order-border p-3 mb-4 m-1">
                <div className="col-6">
                    <h4 className="mb-2">Order# {order._id}</h4>
                    <div className="order-status mb-3">{order.orderStatus}</div>
                    <div className="order-date">Placed on: {new Date(order.orderDate).toLocaleDateString()}</div>
                </div>
              
            </div>

            <div className="row align-items-stretch mb-4 gap-md-0 m-1">
                <div className=" col-sm-6 col-12 ps-md-0 mb-2">
                    <div className="order-border p-3 h-100">
                        <h5 className="mb-3">Customer & Order</h5>
                        <div className="row customer-details">
                            <div className="col-4">
                                <p>Name</p><p>Phone</p><p>Email</p><p>Payment Terms</p>
                            </div>
                            <div className="col-1">
                                <p>:</p><p>:</p><p>:</p><p>:</p>
                            </div>
                            <div className="col-7">
                                <p>{customer.firstName} {customer.lastName}</p>
                                <p>+91 {customer.mobile}</p>
                                <p className="text-break">{customer.email}</p>
                                <p>{order.paymentMode}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className=" col-sm-6 col-12 mb-2">
                    <div className="order-border p-3">
                        <h5 className="mb-3">Shipping Address</h5>
                        <address className="address-book">
                            <p>{address.fullName}</p>
                            <p>Street: {address.address}</p>
                            <p>City: {address.city}</p>
                            <p>State: {address.state}</p>
                            <p>Pin code: {address.pincode}</p>
                            <p>Phone Number: +91 {address.phone}</p>
                        </address>
                    </div>
                </div>

                {/* <div className="col-md-4 col-sm-6 col-12 mb-2">
                    <div className="order-border p-3">
                        <h5 className="mb-3">Billing Address</h5>
                        <address className="address-book">
                            <p>{address.fullName}</p>
                            <p>Street: {address.address}</p>
                            <p>City: {address.city}</p>
                            <p>State: {address.state}</p>
                            <p>Pin code: {address.pincode}</p>
                            <p>Phone Number: +91 {address.phone}</p>
                        </address>
                    </div>
                </div> */}
            </div>

            <div className="row order-border py-4 mb-4 order-item-list m-1 m-md-0 cart-table">
                <h5 className="mb-3">Items ordered</h5>
                <div className="row py-3 order-item-list-header mx-0 my-2 text-nowrap">
                    <div className="col-2 p-md-0">Product Image</div>
                    <div className="col-2 p-md-0">Product name</div>
                    <div className="col-2 text-center">Quantity</div>
                    <div className="col-4">Price</div>
                    <div className="col-2 text-center">Total</div>
                </div>
                {products.map((product, index) => (
                    <div className="row m-0 border-bottom" key={index}>
                        <div className="col-2 p-0">
                            <img src={product.productId.productImage} alt={product.productId.productName} className="image-item d-inline-block" />
                        </div>
                        <div className="col-2 p-0">
                            <div className="d-inline-block">{product.productId.productName}</div>
                        </div>
                        <div className="col-2 text-center">{product.quantity}</div>
                        <div className="col-4">₹{parseFloat(product.price["$numberDecimal"]).toFixed(2)}</div>
                        <div className="col-2 text-center">₹{(parseFloat(product.price["$numberDecimal"]) * product.quantity).toFixed(2)}</div>
                    </div>
                ))}
            <div className="row m-0 border-bottom py-3">
    <div className="col-4 p-0"></div>
    <div className="col-2 text-center"></div>
    <div className="col-4 grey">Subtotal</div>
    <div className="col-2 text-center">₹{subtotalFromProducts.toFixed(2)}</div>
</div>

                <div className="row m-0 border-bottom py-3">
                    <div className="col-4 p-0"></div>
                    <div className="col-2 text-center"></div>
                    <div className="col-4 grey">Shipping Charge</div>
                    <div className="col-2 text-center">₹{parseFloat(order.shippingCharge["$numberDecimal"]).toFixed(2)}</div>
                </div>
                {discount > 0 && (
    <div className="row m-0 border-bottom py-3">
        <div className="col-4 p-0"></div>
        <div className="col-2 text-center"></div>
        <div className="col-4 grey">Discount</div>
        <div className="col-2 text-center text-danger">-₹{discount.toFixed(2)}</div>
    </div>
)}

                <div className="row m-0 border-bottom py-3">
                    <div className="col-4 p-0"></div>
                    <div className="col-2 text-center"></div>
                    <div className="col-4 grey bold">Total</div>
                    <div className="col-2 text-center bold">₹{parseFloat(order.total["$numberDecimal"]).toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
