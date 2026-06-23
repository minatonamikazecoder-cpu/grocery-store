import React, { useEffect, useState } from "react";
import BillingAddressForm from "./BillingAddressForm";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { getDiscountedPrice } from "@/utils/price";
import { calculateOfferDiscount, isOfferApplicable } from "@/utils/offer";
import { Address, CartItem, Offer } from "@/types";

const Checkout = () => {
	const { user } = useAuth();
	const [showBillingForm, setShowBillingForm] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
	const [discountAmount, setDiscountAmount] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		if (user === null) {
			navigate("/login");
		}
	}, [user, navigate]);

	// Fetch Addresses using react-query
	const { data: addressesData, refetch: refetchAddresses } = useQuery({
		queryKey: ["addresses", user?.id],
		queryFn: async () => {
			if (!user?.id) return [];
			const res = await api.get(`/addresses/user/${user.id}`);
			return res.data as Address[];
		},
		enabled: !!user?.id,
	});
	const addresses = addressesData || [];

	// Fetch Cart using react-query
	const { data: cartData } = useQuery({
		queryKey: ["cart", user?.id],
		queryFn: async () => {
			if (!user?.id) return { items: [] };
			const res = await api.get(`/cart/${user.id}`);
			return res.data;
		},
		enabled: !!user?.id,
	});
	const cartItems = cartData?.items || [];

	// Empty cart redirect
	useEffect(() => {
		if (cartItems.length === 0 && user?.id) {
			toast.info("Your cart is empty. Please add items to checkout.");
			navigate("/cart");
		}
	}, [cartItems, navigate, user]);

	useEffect(() => {
		const offerData = sessionStorage.getItem("appliedOffer");
		if (offerData && cartItems.length > 0) {
			const parsedOffer = JSON.parse(offerData);
			checkOffer(parsedOffer);
		}
	}, [cartItems]);

	const checkOffer = (offer: Offer) => {
		const subtotal = cartItems.reduce((total, item) => {
			const salePrice = parseFloat((item.product?.salePrice ?? 0).toString());
			const discount = parseFloat((item.product?.discount ?? 0).toString());
			const discountedPrice = getDiscountedPrice(salePrice, discount);
			return total + discountedPrice * item.quantity;
		}, 0);

		if (isOfferApplicable(subtotal, offer)) {
			setAppliedOffer(offer);
			const finalDiscount = calculateOfferDiscount(subtotal, offer);
			setDiscountAmount(finalDiscount);
			sessionStorage.setItem("appliedOffer", JSON.stringify(offer));
		} else {
			setAppliedOffer(null);
			setDiscountAmount(0);
		}
	};

	const handleSubmit = async (e: React.FormEvent, totalPrice: number) => {
		e.preventDefault();

		let validationErrors: Record<string, string> = {};
		if (!selectedAddress)
			validationErrors.address = "Please select an address.";

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		try {
			await api.get(`/orders/check-stock/${user?.id}`);

			// Create Razorpay order via backend
			const { data } = await api.post(
				"/payment/create-order",
				{
					amount: totalPrice,
				}
			);

			if (!data.success) {
				toast.error("Failed to create Razorpay order");
				return;
			}

			const order = data.order;
			const selectedAddressObj = addresses.find(
				(addr) => addr.id === selectedAddress || addr._id === selectedAddress
			);

			const options = {
				key: import.meta.env.VITE_RAZORPAY_KEY_ID,
				amount: order.amount,
				currency: order.currency,
				name: "Purebite",
				description: "Order Payment",
				order_id: order.id,
				prefill: {
					name: selectedAddressObj?.fullName || "",
					email: user?.email || "",
					contact: selectedAddressObj?.phone || "",
				},
				theme: {
					color: "#3BB77E",
				},
				handler: async function (response: any) {
					try {
						const confirmRes = await api.post(
							"/orders/checkout",
							{
								userId: user?.id,
								addressId: selectedAddress,
								promoCodeId: appliedOffer?.id || null,
								razorpayOrderId: response.razorpay_order_id,
								razorpayPaymentId: response.razorpay_payment_id,
								razorpaySignature: response.razorpay_signature,
							}
						);
						if (confirmRes.status === 201) {
							toast.success("Order placed successfully!");
							navigate("/order-confirm");
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

			const rzp = new (window as any).Razorpay(options);
			rzp.open();
		} catch (error: any) {
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
						{showBillingForm && (
							<BillingAddressForm
								userId={user?.id || ""}
								fetchAddresses={() => {
									refetchAddresses();
								}}
							/>
						)}
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
											className="btn btn-primary js-filter-btn mt-2"
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

interface AddressListProps {
	addresses: Address[];
	setSelectedAddress: (id: string | null) => void;
	selectedAddress: string | null;
	errors: Record<string, string>;
	setErrors: (err: Record<string, string>) => void;
}

const AddressList = ({
	addresses,
	setSelectedAddress,
	selectedAddress,
	errors,
	setErrors,
}: AddressListProps) => {
	const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedAddressId = event.target.value;
		setSelectedAddress(selectedAddressId);
		if (selectedAddressId == null) {
			setErrors({ ...errors, address: "Please select an address" });
		} else {
			setErrors({ ...errors, address: "" });
		}
	};

	return (
		<div className="row g-0 gap-0">
			{addresses.map((address) => {
				const addressId = address.id || address._id || "";
				const fullAddress = `${address.fullName},\n${address.phone},\n${address.address},\n${address.city},\n${address.state} - ${address.pincode}`;

				return (
					<div className="col-md-6 mb-4" key={addressId}>
						<div
							className={`border p-3 h-100 d-flex flex-column justify-content-between address-box ${
								selectedAddress === addressId
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
									value={addressId}
									className="d-none address-radio"
									checked={selectedAddress === addressId}
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

interface CheckoutSummaryProps {
	handleSubmit: (e: React.FormEvent, totalPrice: number) => void;
	errors: Record<string, string>;
	setErrors: (err: Record<string, string>) => void;
	cartItems: CartItem[];
	discountAmount: number;
}

const CheckoutSummary = ({
	handleSubmit,
	cartItems,
	discountAmount,
}: CheckoutSummaryProps) => {
	const subtotal = cartItems.reduce(
		(sum, item) => {
			const salePrice = parseFloat((item.product?.salePrice ?? 0).toString());
			const discount = parseFloat((item.product?.discount ?? 0).toString());
			return sum + getDiscountedPrice(salePrice, discount) * item.quantity;
		},
		0
	);
	const shippingCharge = 50;
	const total = subtotal + shippingCharge - discountAmount;

	return (
		<div className="col-md-6 font-black checkout">
			<div className="mb-2">
				{cartItems.map((item) => {
					const itemId = item.id || item._id || "";
					const salePrice = parseFloat((item.product?.salePrice ?? 0).toString());
					const discount = parseFloat((item.product?.discount ?? 0).toString());
					return (
						<div
							className="d-flex align-items-center p-2"
							key={itemId}
						>
							<img
								src={item.product?.productImage || PLACEHOLDER_IMAGE}
								className="checkout-image h-100"
								alt={item.product?.productName}
								onError={(e) => {
									e.currentTarget.src = PLACEHOLDER_IMAGE;
								}}
							/>
							<div className="item-name ms-2">
								{item.product?.productName} x {item.quantity}
							</div>
							<div className="price">
								₹
								{(
									getDiscountedPrice(salePrice, discount) *
									item.quantity
								).toFixed(2)}
							</div>
						</div>
					);
				})}
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

			<div className="d-flex justify-content-end">
				<button
					className="btn btn-primary w-100 mt-2"
					onClick={(e) => handleSubmit(e, total)}
				>
					Place Order
				</button>
			</div>
		</div>
	);
};

export default Checkout;
