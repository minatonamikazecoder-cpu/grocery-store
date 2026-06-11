import React, { useEffect, useState } from "react";
import BillingAddressForm from "./BillingAddressForm";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";

const Checkout = () => {
	const { user } = useAuth();
	const [showBillingForm, setShowBillingForm] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState(null);
	const [errors, setErrors] = useState({});
	const [addresses, setAddresses] = useState([]);
	const [cartItems, setCartItems] = useState([]);
	const [appliedOffer, setAppliedOffer] = useState(null);
	const [discountAmount, setDiscountAmount] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		if (user?._id) {
			fetchAddresses(user._id);
			fetchCart(user._id);
		} else if (user === null) {
			navigate("/login");
		}
	}, [user, navigate]);
	useEffect(() => {
		const offerData = sessionStorage.getItem("appliedOffer");
		if (offerData && cartItems.length > 0) {
			const parsedOffer = JSON.parse(offerData);
			checkOffer(parsedOffer);
		}
	}, [cartItems]);
	const checkOffer = (offer) => {
		const subtotal = cartItems.reduce((total, item) => {
			const salePrice = parseFloat(item.productId.salePrice) || 0;
			const discount = parseFloat(item.productId.discount) || 0;
			const discountedPrice = salePrice - (salePrice * discount) / 100;
			return total + discountedPrice * item.quantity;
		}, 0);

		if (subtotal >= offer.minimumOrder) {
			setAppliedOffer(offer);
			const offerDiscount = subtotal * (offer.discount / 100);
			 if(discountAmount > offer.maxDiscount){
setDiscountAmount(offer.maxDiscount);
            }
            else{
                setDiscountAmount(offerDiscount);
            }
			sessionStorage.setItem("appliedOffer", JSON.stringify(offer));
		} else {
			setAppliedOffer(null);
		}
	};
	const fetchAddresses = async (userId) => {
		try {
			const res = await api.get(
				`/addresses/user/${userId}`
			);
			setAddresses(res.data);
		} catch (err) {
			console.error("Failed to fetch addresses", err);
		}
	};

	const fetchCart = async (userId) => {
		try {
			const res = await api.get(`/cart/${userId}`);
			setCartItems(res.data.items || []);
		} catch (err) {
			console.error("Failed to fetch cart items", err);
		}
	};

	const handleSubmit = async (e, totalPrice) => {
		e.preventDefault();

		let validationErrors = {};
		if (!selectedAddress)
			validationErrors.address = "Please select an address.";

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		try {
            const stockCheckRes = await api.get(
			`/orders/check-stock/${user?._id}`
		);
		if (stockCheckRes.status=== 400 || stockCheckRes.status=== 500) {
			toast.error(stockCheckRes.data.message);
            
			return;
		}

			// Create Razorpay order via backend
			const { data } = await api.post(
				"/payment/create-order",
				{
					amount: totalPrice, // amount in paise
				}
			);

			if (!data.success) {
				toast.error("Failed to create Razorpay order");
				return;
			}

			const order = data.order;

			const options = {
				key: "rzp_test_mEljxG2Cvuw6qT",
				amount: order.amount,
				currency: order.currency,
				name: "Purebite",
				description: "Order Payment",
				order_id: order.id,
				prefill: {
					name: `${selectedAddress.firstName || ""} ${
						selectedAddress.lastName || ""
					}`,
					email: selectedAddress.email || "",
					contact: selectedAddress.phone || "",
				},
				theme: {
					color: "#53B175",
				},
				handler: async function (response) {
					try {
						const confirmRes = await api.post(
							"/orders/checkout",
							{
								userId: user?._id,
								addressId: selectedAddress,
								promoCodeId: appliedOffer?._id || null,
								razorpayOrderId: response.razorpay_order_id,
								razorpayPaymentId: response.razorpay_payment_id,
								razorpaySignature: response.razorpay_signature,
							}
						);
						if (confirmRes.status === 201) {
							toast.success("Order placed successfully!");
							
							navigate("/order-history");
						} else {
							toast.error(
								"Payment succeeded but order confirmation failed."
							);
						}
					} catch (err) {
						console.clear();
						console.error(err);
						toast.error("Failed to confirm payment.");
					}
				},
				modal: {
					ondismiss: function () {
						toast.info("Payment cancelled");
					},
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (error) {
			console.error(error);
			toast.error(
				error.response?.data?.message || "Something went wrong!"
			);
		}
	};

	const toggleBillingForm = () => {
		setShowBillingForm(!showBillingForm);
	};

	return (
		<>
			<div className="container sitemap">
				<p className="mt-5">
					<Link to="/" className="text-decoration-none dim link">
						Home /
					</Link>
					<Link to="/cart" className="text-decoration-none dim link">
						Cart /
					</Link>
					Checkout
				</p>
			</div>
			<div className="container">
				<div className="row g-5">
					<div className="col-md-6">
						{showBillingForm && <BillingAddressForm  userId={user?._id} fetchAddresses={fetchAddresses} /> }
						<div
							className="card border-0"
							style={{ marginTop: "20px" }}
						>
							<form className="form">
								<div className="d-flex justify-content-between align-content-center mb-3">
									<h5 className="mt-2">
										Select Shipping Address
									</h5>
									<div className="d-flex justify-content-end">
										<button
											type="button"
											onClick={toggleBillingForm}
											className="primary-btn js-filter-btn mt-2"
										>
											Add New Address
										</button>
									</div>
								</div>
								<AddressList
									addresses={addresses}
									setSelectedAddress={setSelectedAddress}
									selectedAddress={selectedAddress}
									errors={errors}
									setErrors={setErrors}
								/>
								{errors.address && (
									<p className="text-danger">
										{errors.address}
									</p>
								)}
							</form>
						</div>
					</div>
					<CheckoutSummary
						handleSubmit={handleSubmit}
						errors={errors}
						setErrors={setErrors}
						cartItems={cartItems}
						discountAmount={discountAmount}
					/>
				</div>
			</div>
		</>
	);
};
const AddressList = ({
	addresses,
	setSelectedAddress,
	selectedAddress,
	errors,
	setErrors,
}) => {
	const handleAddressChange = (event) => {
		const selectedAddressId = event.target.value;
		setSelectedAddress(selectedAddressId); // Convert to number if needed
		if (selectedAddressId == null) {
			setErrors({ ...errors, address: "Please select an address" });
		} else {
			setErrors({ ...errors, address: "" });
		}
	};

	return (
		<div className="row g-0 gap-0">
			{addresses.map((address) => {
				const fullAddress = `${address.fullName},\n${address.phone},\n${address.address},\n${address.city},\n${address.state} - ${address.pincode}`;

				return (
					<div className="col-md-6 mb-4" key={address._id}>
						<div
							className={`border p-3 h-100 d-flex flex-column justify-content-between address-box ${
								selectedAddress === address._id
									? "selected"
									: ""
							}`}
						>
							<label
								className="d-flex flex-column"
								style={{ cursor: "pointer" }}
							>
								<input
									type="radio"
									name="add"
									value={address._id}
									className="d-none address-radio"
									checked={selectedAddress === address._id}
									onChange={handleAddressChange}
								/>
								<span style={{ whiteSpace: "pre-line" }}>
									{fullAddress}
								</span>
							</label>
						</div>
					</div>
				);
			})}
		</div>
	);
};

const CheckoutSummary = ({
	handleSubmit,
	errors,
	setErrors,
	cartItems,
	discountAmount,
}) => {
	const subtotal = cartItems.reduce(
		(sum, item) =>
			sum +
			item.productId.salePrice *
				(1 - item.productId.discount / 100) *
				item.quantity,
		0
	);
	const shippingCharge = 50;
	const total = subtotal + shippingCharge - discountAmount;

	return (
		<div className="col-md-6 font-black checkout">
			<div className="mb-2">
				{cartItems.map((item) => (
					<div
						className="d-flex align-items-center p-2"
						key={item._id}
					>
						<img
							src={item.productId.productImage}
							className="checkout-image h-100"
							alt={item.productId.productName}
						/>
						<div className="item-name ms-2">
							{item.productId.productName} x {item.quantity}
						</div>
						<div className="price">
							₹
							{(
								item.productId.salePrice *
								(1 - item.productId.discount / 100) *
								item.quantity
							).toFixed(2)}
						</div>
					</div>
				))}
			</div>

			<div className="d-flex align-items-center p-2">
				<div>Subtotal:</div>
				<div className="price">₹{subtotal.toFixed(2)}</div>
			</div>

			<div className="my-2 line"></div>
			<div className="d-flex align-items-center p-2">
				<div>Shipping:</div>
				<div className="price">₹{shippingCharge.toFixed(2)}</div>
			</div>

			{discountAmount > 0 && (
				<>
					<div className="my-2 line"></div>
					<div className="d-flex align-items-center p-2 text-danger">
						<div>Discount:</div>
						<div className="price">
							-₹{discountAmount.toFixed(2)}
						</div>
					</div>
				</>
			)}

			<div className="my-2 line"></div>
			<div className="d-flex align-items-center p-2">
				<div>Total:</div>
				<div className="price">₹{total.toFixed(2)}</div>
			</div>

			{errors.payment && <p className="text-danger">{errors.payment}</p>}
			<div className="d-flex justify-content-end">
				<button
					className="btn-msg mt-2"
					onClick={(e) => handleSubmit(e, total)}
				>
					Place Order
				</button>
			</div>
		</div>
	);
};

export default Checkout;
