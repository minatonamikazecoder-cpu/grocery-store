// src/components/Cart.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext"; // Importing AuthContext

const Cart = () => {
	const shippingCharge = 50;
	const { cartCount, updateCartCount } = useAuth(); // Accessing cart count and update method from AuthContext
	const [cart, setCart] = useState([]);
	const [offers, setOffers] = useState([]);
	const [appliedOffer, setAppliedOffer] = useState(null);
	const [discountAmount, setDiscountAmount] = useState(0);
    useEffect(() => {
        if (cart.length > 0) {
            const storedOffer = sessionStorage.getItem("appliedOffer");
            if (storedOffer) {
                checkOffer(JSON.parse(storedOffer));
            }
        }
    }, [cart]); // Run only when cart is updated
const checkOffer = (offer) => {
		const subtotal = cart.reduce((total, item) => {
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
		} 
        else{
            setAppliedOffer(null);
        }
	};
	const applyOffer = (offer) => {
		const subtotal = cart.reduce((total, item) => {
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
			toast.success("Offer applied successfully!");
		} else {
			toast.error(
				`This offer requires a minimum purchase of ₹${offer.minimumOrder}`
			);
		}
	};

	// Fetch cart items dynamically
	useEffect(() => {
		const user = JSON.parse(localStorage.getItem("user"));
		const token = localStorage.getItem("token");
		if (!user || !user._id) {
			toast.error("User not found in local storage");
			return;
		}

		api
			.get(`/cart/${user._id}`)
			.then((response) => {
				setCart(response.data.items); // Ensure the data structure is correct
				updateCartCount(response.data.items.length); // Update the global cart count
			})
			.catch((error) => toast.error("Failed to fetch cart data"));
		// Fetch offers

		api
			.get("/offers")
			.then((res) => {
				const activeOffers = res.data.filter((o) => o.activeStatus);
				setOffers(activeOffers);
			})
			.catch(() => toast.error("Failed to load offers"));

	}, [updateCartCount]);

	const handleQuantityChange = (id, amount) => {
		const user = JSON.parse(localStorage.getItem("user"));

		setCart((prevCart) =>
			prevCart.map((item) =>
				item.productId._id === id
					? { ...item, quantity: Math.max(1, item.quantity + amount) }
					: item
			)
		);

		const updatedItem = cart.find((item) => item.productId._id === id);
		api
			.put(`/cart/${user._id}`, {
				productId: id,
				quantity: updatedItem.quantity + amount,
			})
			.then(() => {
				toast.success("Cart updated successfully");
				updateCartCount(cart.length); // Ensure cart count is updated correctly
			})
			.catch(() => {
				toast.error("Failed to update cart");
			});
	};

	const handleDelete = (id) => {
		const user = JSON.parse(localStorage.getItem("user"));

		api
			.delete(`/cart/${user._id}`, {
				data: { productId: id },
			})
			.then(() => {
				toast.success("Product removed from cart!", {
					position: "top-right",
				});
				setCart(cart.filter((item) => item.productId._id !== id)); // Remove the item from the state
				updateCartCount(cart.length - 1); // Decrease global cart count when item is removed
			})
			.catch(() => {
				toast.error("Failed to remove product!");
			});
	};

	const subtotal = cart.reduce((total, item) => {
		const salePrice = parseFloat(item.productId.salePrice) || 0;
		const discount = parseFloat(item.productId.discount) || 0;
		const discountedPrice = salePrice - (salePrice * discount) / 100;
		return total + discountedPrice * item.quantity;
	}, 0);
	const total = subtotal + shippingCharge;

	return (
		<div className="container sitemap mt-5">
			<p>
				<Link to="/" className="text-decoration-none dim link">
					Home /
				</Link>{" "}
				Cart
			</p>
			{cart.length === 0 ? (
							<div className="alert alert-info text-center">
								Your cart is empty.{" "}
								<Link to="/shop">Continue Shopping</Link>
							</div>
						) : (<div className="table-responsive">
				<table className="table cart-table text-nowrap mt-5">
					<thead>
						<tr className="heading text-center">
							<th className="text-start">Product</th>
							<th>Price</th>
							<th>Quantity</th>
							<th>Subtotal</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{
							cart.map((product) => (
								<CartItem
									key={product.productId._id}
									product={product}
									onQuantityChange={handleQuantityChange}
									onDelete={handleDelete}
								/>
							))
						}
					</tbody>
				</table>
			</div>)}
			<CartActions offers={offers} onApply={applyOffer} />
			<CartSummary
				subtotal={subtotal}
				shippingCharge={shippingCharge}
				discount={discountAmount}
				total={subtotal - discountAmount + shippingCharge}
				appliedOffer={appliedOffer}
			/>
		</div>
	);
};

const CartItem = ({ product, onQuantityChange, onDelete }) => {
	// Ensure salePrice and discount are valid numbers
	const salePrice = parseFloat(product.productId.salePrice) || 0; // Default to 0 if invalid
	const discount = parseFloat(product.productId.discount) || 0; // Default to 0 if invalid

	// Calculate the discounted price, ensuring we avoid NaN
	let discountedPrice = salePrice - (salePrice * discount) / 100;

	return (
		<tr>
			<td className="text-start">
				<img
					src={product.productId.productImage}
					alt={product.productId.productName}
					className="image-item d-inline-block"
				/>
				<div className="d-inline-block">
					{product.productId.productName}
				</div>
			</td>
			<td className="text-center">₹{discountedPrice.toFixed(2)}</td>{" "}
			{/* Round to 2 decimal places */}
			<td>
				<div className="d-flex justify-content-center qty-mod">
					<button
						className="number-button qty-minus rounded-start"
						onClick={() =>
							onQuantityChange(product.productId._id, -1)
						}
					>
						<i className="fas fa-minus"></i>
					</button>
					<input
						type="text"
						value={product.quantity}
						readOnly
						className="text-center border-start-0 border-end-0"
						style={{
							width: "60px",
							border: "1px solid #dee2e6",
							outline: "none",
						}}
					/>
					<button
						className="number-button qty-plus rounded-end"
						onClick={() =>
							onQuantityChange(product.productId._id, 1)
						}
					>
						<i className="fas fa-plus"></i>
					</button>
				</div>
			</td>
			<td className="text-center">
				₹{(discountedPrice * product.quantity).toFixed(2)}
			</td>{" "}
			{/* Round to 2 decimal places */}
			<td className="text-center">
				<button
					className="primary-btn delete-btn"
					onClick={() => onDelete(product.productId._id)}
				>
					Remove
				</button>
			</td>
		</tr>
	);
};
const CartActions = ({ offers, onApply, appliedOffer }) => {
	return (
		<div className="container mb-5">
			<h5 className="mb-3">Available Offers</h5>
			{!offers || offers.length === 0 ? (
				<div className="alert alert-warning" role="alert">
					No active offers available.
				</div>
			) : (
				<div className="list-group shadow-sm">
					{offers.map((offer) => {
						const isApplied =
							appliedOffer &&
							appliedOffer.offerCode == offer.offerCode;

						return (
							<div
								key={offer._id}
								className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
							>
								<div className="me-3">
									<span className="badge bg-primary me-2">
										{offer.offerCode}
									</span>
									<span className="text-muted">
										{offer.discount}% off on orders over ₹
										{offer.minimumOrder}
									</span>
								</div>
								{isApplied ? (
									<span className="badge bg-success">
										Applied
									</span>
								) : (
									<button
										className="btn btn-outline-success btn-sm"
										onClick={() => onApply(offer)}
									>
										Apply
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

const CartSummary = ({
	subtotal,
	shippingCharge,
	discount = 0,
	total,
	appliedOffer,
}) => {
	return (
		<div className="container mb-5">
			<div className="row justify-content-end">
				<div className="col-md-5 col-sm-7">
					<div className="bold-border p-4">
						<h5 className="mb-3">Cart Total</h5>
						<div className="d-flex justify-content-between p-2">
							<div>Subtotal:</div>
							<div className="price">₹{subtotal.toFixed(2)}</div>
						</div>
						{appliedOffer && (
							<div className="d-flex justify-content-between p-2 text-success">
								<div>
									Offer ({appliedOffer.offerCode}) Applied:
								</div>
								<div>-₹{discount.toFixed(2)}</div>
							</div>
						)}
						<div className="d-flex justify-content-between p-2">
							<div>Shipping:</div>
							<div className="price">₹{shippingCharge}</div>
						</div>
						<div className="my-2 line"></div>
						<div className="d-flex justify-content-between p-2 fw-bold">
							<div>Total:</div>
							<div className="price">₹{total.toFixed(2)}</div>
						</div>
						<div className="d-flex justify-content-center w-100 mt-3">
							<Link
								to="/checkout"
								className="btn-msg checkout-link text-nowrap"
							>
								Proceed to checkout
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Cart;
