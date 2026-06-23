import { Link } from "react-router-dom";

const OrderConfirmation = () => {
    return (
        <div className="container d-flex flex-column align-items-center justify-content-center w-100 h-100">
            <div className="circle mt-5">
                <i className="fa-solid fa-check"></i>
            </div>
            <div className="content text-center mb-5">
                <h5>Thank you for ordering!</h5>
                <p>Your order has been successfully placed and will be processed shortly.</p>
                <div className="buttons-container">
                    <Link className="btn btn-primary view-order-btn" to="/order-history">View Orders</Link>
                    <Link className="btn btn-primary checkout-link" to="/shop">Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
