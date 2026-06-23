import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import Skeleton from "@/components/user/Skeleton";
import { useCart } from "@/contexts/CartContext";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { getDiscountedPrice } from "@/utils/price";
import { calculateOfferDiscount, isOfferApplicable } from "@/utils/offer";
import { CartItem as TCartItem, Offer as TOffer } from "@/types";

const Cart = () => {
	const shippingCharge = 50;
	const { user } = useAuth();
	const { updateCartCount } = useCart();
	const queryClient = useQueryClient();

	const [appliedOffer, setAppliedOffer] = useState<TOffer | null>(null);
	const [discountAmount, setDiscountAmount] = useState(0);

	// Fetch Cart
	const { data: cartData, isLoading: isCartLoading } = useQuery({
		queryKey: ["cart", user?.id],
		queryFn: async () => {
			if (!user?.id) return { items: [] };
			const res = await api.get(`/cart/${user.id}`);
			return res.data;
		},
		enabled: !!user?.id,
	});
	const cart: TCartItem[] = cartData?.items || [];

	// Fetch Offers
	const { data: offersData, isLoading: isOffersLoading } = useQuery({
		queryKey: ["offers"],
		queryFn: async () => {
			const res = await api.get("/offers");
			return res.data.filter((o: any) => o.activeStatus) as TOffer[];
		},
	});
	const offers = offersData || [];

	const loading = isCartLoading || isOffersLoading;

	// Invalidate and sync counts
	useEffect(() => {
		if (cart) {
			updateCartCount(cart.length);
		}
	}, [cart, updateCartCount]);

	useEffect(() => {
		if (cart.length > 0) {
			const storedOffer = sessionStorage.getItem("appliedOffer");
			if (storedOffer) {
				checkOffer(JSON.parse(storedOffer));
			}
		} else {
			setAppliedOffer(null);
			setDiscountAmount(0);
		}
	}, [cartData]);

	const checkOffer = (offer: TOffer) => {
		const subtotal = cart.reduce((total, item) => {
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

	const applyOffer = (offer: TOffer) => {
		const subtotal = cart.reduce((total, item) => {
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
			toast.success("Offer applied successfully!");
		} else {
			toast.error(
				`This offer requires a minimum purchase of ₹${offer.minimumOrder}`
			);
		}
	};

	// Mutations
	const updateCartMutation = useMutation({
		mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
			if (!user?.id) throw new Error("User not logged in");
			return api.put(`/cart/${user.id}`, { productId, quantity });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
			toast.success("Cart updated successfully");
		},
		onError: () => {
			toast.error("Failed to update cart");
		},
	});

	const deleteCartMutation = useMutation({
		mutationFn: async (productId: string) => {
			if (!user?.id) throw new Error("User not logged in");
			return api.delete(`/cart/${user.id}`, { data: { productId } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
			toast.success("Product removed from cart!");
		},
		onError: () => {
			toast.error("Failed to remove product!");
		},
	});

	const handleQuantityChange = (id: string, amount: number) => {
		const updatedItem = cart.find((item) => item.product?.id === id || item.product?._id === id);
		if (!updatedItem) return;
		const newQty = Math.max(1, updatedItem.quantity + amount);
		updateCartMutation.mutate({ productId: id, quantity: newQty });
	};

	const handleDelete = (id: string) => {
		deleteCartMutation.mutate(id);
	};

	const subtotal = cart.reduce((total, item) => {
		const salePrice = parseFloat((item.product?.salePrice ?? 0).toString());
		const discount = parseFloat((item.product?.discount ?? 0).toString());
		const discountedPrice = getDiscountedPrice(salePrice, discount);
		return total + discountedPrice * item.quantity;
	}, 0);

	return (
		<div className="container sitemap mt-5">
			<p>
				<Link to="/" className="text-decoration-none dim link">
					Home /
				</Link>{" "}
				Cart
			</p>
			{loading ? (
				<div className="table-responsive">
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
							{[1, 2].map((i) => (
								<tr key={i}>
									<td className="text-start">
										<div className="d-flex align-items-center">
											<Skeleton width="60px" height="60px" borderRadius="4px" style={{ marginRight: "10px" }} />
											<Skeleton width="150px" height="18px" className="-text" style={{ marginBottom: "0" }} />
										</div>
									</td>
									<td>
										<Skeleton width="60px" height="18px" className="-text" style={{ margin: "auto" }} />
									</td>
									<td>
										<Skeleton width="120px" height="35px" borderRadius="20px" style={{ margin: "auto" }} />
									</td>
									<td>
										<Skeleton width="60px" height="18px" className="-text" style={{ margin: "auto" }} />
									</td>
									<td>
										<Skeleton width="80px" height="38px" className="-button" style={{ margin: "auto" }} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : cart.length === 0 ? (
				<div className="empty-state-container my-5">
					<svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
					</svg>
					<h3 className="empty-state-title">Your Cart is Empty</h3>
					<p className="empty-state-text">
						Looks like you haven't added anything to your cart yet. Explore our wide selection of fresh organic groceries and start shopping!
					</p>
					<Link to="/shop" className="btn btn-primary empty-state-btn">
						Shop Now
					</Link>
				</div>
			) : (
				<>
					<div className="table-responsive">
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
									cart.map((item) => {
										const productId = item.product?.id || item.product?._id || "";
										return (
											<CartItem
												key={productId}
												item={item}
												onQuantityChange={handleQuantityChange}
												onDelete={handleDelete}
											/>
										);
									})
								}
							</tbody>
						</table>
					</div>
					<CartActions offers={offers} onApply={applyOffer} appliedOffer={appliedOffer} loading={loading} />
					<CartSummary
						subtotal={subtotal}
						shippingCharge={shippingCharge}
						discount={discountAmount}
						total={subtotal - discountAmount + shippingCharge}
						appliedOffer={appliedOffer}
						loading={loading}
					/>
				</>
			)}
		</div>
	);
};

interface CartItemProps {
	item: TCartItem;
	onQuantityChange: (id: string, amount: number) => void;
	onDelete: (id: string) => void;
}

const CartItem = ({ item, onQuantityChange, onDelete }: CartItemProps) => {
	const salePrice = parseFloat((item.product?.salePrice ?? 0).toString());
	const discount = parseFloat((item.product?.discount ?? 0).toString());

	let discountedPrice = getDiscountedPrice(salePrice, discount);
	const productId = item.product?.id || item.product?._id || "";

	return (
		<tr>
			<td className="text-start">
				<img
					src={item.product?.productImage || PLACEHOLDER_IMAGE}
					alt={item.product?.productName}
					className="image-item d-inline-block"
					onError={(e) => {
						e.currentTarget.src = PLACEHOLDER_IMAGE;
					}}
				/>
				<div className="d-inline-block ms-2">
					{item.product?.productName}
				</div>
			</td>
			<td className="text-center">₹{discountedPrice.toFixed(2)}</td>
			<td>
				<div className="d-flex justify-content-center">
					<div className="modern-qty-selector">
						<button
							className="qty-btn"
							type="button"
							onClick={() =>
								onQuantityChange(productId, -1)
							}
							disabled={item.quantity <= 1}
						>
							<i className="fa fa-minus"></i>
						</button>
						<span className="qty-value">{item.quantity}</span>
						<button
							className="qty-btn"
							type="button"
							onClick={() =>
								onQuantityChange(productId, 1)
							}
							disabled={item.product?.stock !== undefined && item.quantity >= item.product.stock}
						>
							<i className="fa fa-plus"></i>
						</button>
					</div>
				</div>
			</td>
			<td className="text-center">
				₹{(discountedPrice * item.quantity).toFixed(2)}
			</td>
			<td className="text-center">
				<button
					className="btn btn-primary delete-btn"
					onClick={() => onDelete(productId)}
				>
					Remove
				</button>
			</td>
		</tr>
	);
};

interface CartActionsProps {
	offers: TOffer[];
	onApply: (offer: TOffer) => void;
	appliedOffer: TOffer | null;
	loading?: boolean;
}

const CartActions = ({ offers, onApply, appliedOffer, loading }: CartActionsProps) => {
	return (
		<div className="container mb-5">
			<h5 className="mb-3">Available Offers</h5>
			{loading ? (
				<div className="list-group shadow-sm">
					{[1, 2].map((i) => (
						<div key={i} className="list-group-item d-flex justify-content-between align-items-center flex-wrap" style={{ height: '56px' }}>
							<div className="d-flex align-items-center w-50">
								<Skeleton width="60px" height="24px" borderRadius="4px" style={{ marginRight: "10px" }} />
								<Skeleton width="150px" height="14px" className="-text" style={{ marginBottom: "0" }} />
							</div>
							<Skeleton width="80px" height="32px" className="-button" />
						</div>
					))}
				</div>
			) : !offers || offers.length === 0 ? (
				<div className="alert alert-warning" role="alert">
					No active offers available.
				</div>
			) : (
				<div className="list-group shadow-sm">
					{offers.map((offer) => {
						const isApplied =
							appliedOffer &&
							appliedOffer.offerCode === offer.offerCode;

						const offerId = offer.id || offer._id || "";

						return (
							<div
								key={offerId}
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

interface CartSummaryProps {
	subtotal: number;
	shippingCharge: number;
	discount: number;
	total: number;
	appliedOffer: TOffer | null;
	loading?: boolean;
}

const CartSummary = ({
	subtotal,
	shippingCharge,
	discount = 0,
	total,
	appliedOffer,
	loading,
}: CartSummaryProps) => {
	return (
		<div className="container mb-5">
			<div className="row justify-content-end">
				<div className="col-md-5 col-sm-7">
					{loading ? (
						<div className="bold-border p-4" style={{ height: '260px' }}>
							<Skeleton width="40%" height="22px" className="-text mb-4" />
							<div className="d-flex justify-content-between mb-3">
								<Skeleton width="30%" height="14px" className="-text" />
								<Skeleton width="20%" height="14px" className="-text" />
							</div>
							<div className="d-flex justify-content-between mb-3">
								<Skeleton width="30%" height="14px" className="-text" />
								<Skeleton width="20%" height="14px" className="-text" />
							</div>
							<Skeleton width="100%" height="2px" className="-text mb-4" />
							<div className="d-flex justify-content-between mb-4">
								<Skeleton width="30%" height="18px" className="-text" />
								<Skeleton width="25%" height="18px" className="-text" />
							</div>
							<Skeleton height="40px" borderRadius="4px" className="-button w-100" />
						</div>
					) : (
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
								className="btn btn-primary w-100 checkout-link text-nowrap"
							>
								Proceed to checkout
							</Link>
						</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Cart;
