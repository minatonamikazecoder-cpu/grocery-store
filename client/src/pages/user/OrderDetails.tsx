import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { Order, OrderItem } from "@/types";

const OrderDetails = () => {
    const { orderId } = useParams<{ orderId: string }>();

    const { data: orderDetailsData, isLoading: loading } = useQuery({
        queryKey: ["orderDetails", orderId],
        queryFn: async () => {
            if (!orderId) return null;
            const res = await api.get(`/orders/${orderId}`);
            // Standardized API wraps data inside data.data
            return res.data.data as { order: Order; orderItems: OrderItem[] };
        },
        enabled: !!orderId,
    });

    if (loading) {
        return (
            <div className="container sitemap">
                <div className="skeleton skeleton-text my-5" style={{ width: "30%", height: "20px" }}></div>
                
                <div className="row order-border p-3 mb-4 m-1">
                    <div className="col-6">
                        <div className="skeleton skeleton-text" style={{ width: "50%", height: "24px", marginBottom: "10px" }}></div>
                        <div className="skeleton skeleton-text" style={{ width: "20%", height: "18px", marginBottom: "10px" }}></div>
                        <div className="skeleton skeleton-text" style={{ width: "30%", height: "14px" }}></div>
                    </div>
                </div>

                <div className="row align-items-stretch mb-4 gap-md-0 m-1">
                    <div className="col-sm-6 col-12 ps-md-0 mb-2">
                        <div className="order-border p-3 h-100">
                            <div className="skeleton skeleton-text mb-3" style={{ width: "40%", height: "20px" }}></div>
                            <div className="row">
                                <div className="col-4">
                                    <div className="skeleton skeleton-text mb-2" style={{ width: "80%", height: "14px" }}></div>
                                    <div className="skeleton skeleton-text mb-2" style={{ width: "80%", height: "14px" }}></div>
                                    <div className="skeleton skeleton-text mb-2" style={{ width: "80%", height: "14px" }}></div>
                                    <div className="skeleton skeleton-text" style={{ width: "80%", height: "14px" }}></div>
                                </div>
                                <div className="col-8">
                                    <div className="skeleton skeleton-text mb-2" style={{ width: "90%", height: "14px" }}></div>
                                    <div className="skeleton skeleton-text mb-2" style={{ width: "60%", height: "14px" }}></div>
                                    <div className="skeleton skeleton-text mb-2" style={{ width: "80%", height: "14px" }}></div>
                                    <div className="skeleton skeleton-text" style={{ width: "40%", height: "14px" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-sm-6 col-12 mb-2">
                        <div className="order-border p-3 h-100">
                            <div className="skeleton skeleton-text mb-3" style={{ width: "40%", height: "20px" }}></div>
                            <div className="skeleton skeleton-text mb-2" style={{ width: "50%", height: "14px" }}></div>
                            <div className="skeleton skeleton-text mb-2" style={{ width: "80%", height: "14px" }}></div>
                            <div className="skeleton skeleton-text mb-2" style={{ width: "70%", height: "14px" }}></div>
                            <div className="skeleton skeleton-text" style={{ width: "30%", height: "14px" }}></div>
                        </div>
                    </div>
                </div>

                <div className="row order-border p-3 m-1">
                    <div className="col-12">
                        <div className="skeleton skeleton-text mb-3" style={{ width: "20%", height: "20px" }}></div>
                        {[1, 2].map(i => (
                            <div key={i} className="d-flex align-items-center mb-3">
                                <div className="skeleton" style={{ width: "60px", height: "60px", borderRadius: "4px", marginRight: "15px" }}></div>
                                <div className="flex-grow-1">
                                    <div className="skeleton skeleton-text mb-2" style={{ width: "40%", height: "16px" }}></div>
                                    <div className="skeleton skeleton-text" style={{ width: "10%", height: "14px" }}></div>
                                </div>
                                <div className="skeleton skeleton-text" style={{ width: "80px", height: "16px" }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!orderDetailsData) return <div className="text-center my-5">Order not found.</div>;

    const { order, orderItems } = orderDetailsData;
    if (!order) return <div className="text-center my-5">Order not found.</div>;

    const customer = order.user || order.userId;
    const address = order.delAddress || order.delAddressId;
    const products = orderItems || [];

    const subtotalFromProducts = products.reduce((acc, item) => {
        const price = parseFloat(item.price ? item.price.toString() : "0");
        return acc + price * item.quantity;
    }, 0);

    const orderTotal = parseFloat(order.total ? order.total.toString() : "0");
    const shippingCharge = parseFloat(order.shippingCharge ? order.shippingCharge.toString() : "0");
    const actualSubtotal = orderTotal - shippingCharge;

    const discount = subtotalFromProducts - actualSubtotal;

    return (
        <div className="container sitemap">
            <p className="my-5">
                <Link to="/" className="text-decoration-none dim link">Home /</Link>
                <Link to="/order-history" className="text-decoration-none dim link">Orders /</Link>
                Order# {order.id || order._id}
            </p>

            <div className="row order-border p-3 mb-4 m-1">
                <div className="col-6">
                    <h4 className="mb-2">Order# {order.id || order._id}</h4>
                    <div className="order-status mb-3">{order.orderStatus}</div>
                    <div className="order-date">Placed on: {new Date(order.orderDate).toLocaleDateString()}</div>
                </div>
            </div>

            <div className="row align-items-stretch mb-4 gap-md-0 m-1">
                <div className="col-sm-6 col-12 ps-md-0 mb-2">
                    <div className="order-border p-3 h-100">
                        <h5 className="mb-3">Customer & Order</h5>
                        {customer && (
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
                        )}
                    </div>
                </div>

                <div className="col-sm-6 col-12 mb-2">
                    <div className="order-border p-3">
                        <h5 className="mb-3">Shipping Address</h5>
                        {address && (
                            <address className="address-book">
                                <p>{address.fullName}</p>
                                <p>Street: {address.address}</p>
                                <p>City: {address.city}</p>
                                <p>State: {address.state}</p>
                                <p>Pin code: {address.pincode}</p>
                                <p>Phone Number: +91 {address.phone}</p>
                            </address>
                        )}
                    </div>
                </div>
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
                {products.map((item, index) => {
                    const priceVal = parseFloat(item.price ? item.price.toString() : "0");
                    const itemProduct = item.product || item.productId;
                    return (
                        <div className="row m-0 border-bottom" key={index}>
                            <div className="col-2 p-0">
                                <img
                                    src={itemProduct?.productImage || PLACEHOLDER_IMAGE}
                                    alt={itemProduct?.productName}
                                    className="image-item d-inline-block"
                                    onError={(e) => {
                                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                                    }}
                                />
                            </div>
                            <div className="col-2 p-0">
                                <div className="d-inline-block">{itemProduct?.productName}</div>
                            </div>
                            <div className="col-2 text-center">{item.quantity}</div>
                            <div className="col-4">₹{priceVal.toFixed(2)}</div>
                            <div className="col-2 text-center">₹{(priceVal * item.quantity).toFixed(2)}</div>
                        </div>
                    );
                })}
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
                    <div className="col-2 text-center">₹{shippingCharge.toFixed(2)}</div>
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
                    <div className="col-2 text-center bold">₹{orderTotal.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
