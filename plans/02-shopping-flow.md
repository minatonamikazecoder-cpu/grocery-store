# Plan 02 — Shopping Flow: Cart, Checkout & Orders

**Priority:** 🔴 Critical | **Estimated effort:** 3-4 days

---

## 🎯 Goal

Fix all broken/stub pages in the core shopping journey and correct the discount/price calculation bugs that affect real money calculations.

---

## 🐛 Critical Bugs to Fix

### BUG-01: `OrderDetails.tsx` — MongoDB `$numberDecimal` format (CRASH BUG)

**File:** `client/src/pages/user/OrderDetails.tsx` (lines 110-115, 212, 213, 227, 242)

**Problem:** The code accesses `product.price["$numberDecimal"]`, `order.total["$numberDecimal"]`, etc. This is a MongoDB/Mongoose-specific format. The backend uses TypeORM + PostgreSQL which returns plain JavaScript numbers. **This page will crash for every user.**

```typescript
// BROKEN — will throw "Cannot read properties of undefined (reading '$numberDecimal')"
const price = parseFloat(product.price["$numberDecimal"]);
const orderTotal = parseFloat(order.total["$numberDecimal"]);

// CORRECT — TypeORM returns plain numbers
const price = parseFloat(String(product.price));
const orderTotal = parseFloat(String(order.total));
```

**Fix:** Replace ALL occurrences of `["$numberDecimal"]` with direct number access. Also add defensive `Number()` coercion.

**All occurrences to fix:**
- Line 110: `product.price["$numberDecimal"]` → `Number(product.price)`
- Line 114: `order.total["$numberDecimal"]` → `Number(order.total)`
- Line 115: `order.shippingCharge["$numberDecimal"]` → `Number(order.shippingCharge)`
- Line 212: same pattern
- Line 213: same pattern
- Line 227: same pattern
- Line 242: same pattern

---

### BUG-02: `Cart.tsx` — Offer discount calculation bug (WRONG MONEY CALCULATION)

**File:** `client/src/pages/user/Cart.tsx` (lines 42-46 and 64-68)

**Problem:** The `checkOffer` and `applyOffer` functions have an identical logic bug:

```typescript
// BROKEN — discountAmount is the React state (0 on first call), not the newly computed value
if (discountAmount > offer.maxDiscount) {
  setDiscountAmount(offer.maxDiscount);
} else {
  setDiscountAmount(offerDiscount);
}
```

This always takes the `else` branch on the first apply because `discountAmount` state is `0`.

**Fix:**
```typescript
// CORRECT — compare the newly computed value against the cap
const offerDiscount = subtotal * (offer.discount / 100);
const finalDiscount = Math.min(offerDiscount, offer.maxDiscount);
setDiscountAmount(finalDiscount);
```

**Also fix:** This exact same bug exists in `Checkout.tsx` (lines 47-52). Fix in both files.

**Also fix:** Extract into a shared utility:
```typescript
// client/src/utils/offer.ts
export function calculateOfferDiscount(subtotal: number, offer: Offer): number {
  if (subtotal < offer.minimumOrder) return 0;
  const raw = subtotal * (offer.discount / 100);
  return Math.min(raw, offer.maxDiscount);
}
```

---

### BUG-03: `Checkout.tsx` — Dead stock check code

**File:** `client/src/pages/user/Checkout/Checkout.tsx` (lines 96-103)

**Problem:** Axios throws an error on 4xx responses. A resolved promise from `api.get()` will NEVER have `status === 400`. The check is dead code.

```typescript
// BROKEN — this condition can NEVER be true
const stockCheckRes = await api.get(`/orders/check-stock/${user?.id}`);
if (stockCheckRes.status === 400 || stockCheckRes.status === 500) {
  toast.error(stockCheckRes.data.message);
  return;
}
```

**Fix:** Wrap in try/catch and catch the Axios error:
```typescript
try {
  await api.get(`/orders/check-stock/${user?.id}`);
} catch (stockError: any) {
  toast.error(stockError.response?.data?.message || 'Stock unavailable. Please review your cart.');
  return;
}
```

---

### BUG-04: `OrderHistory.tsx` — Stub page (COMPLETELY BROKEN)

**File:** `client/src/pages/user/OrderHistory.tsx` (only 402 bytes)

**Problem:** This page is a stub. Users who complete checkout get redirected here but see nothing.

**Fix:** Implement a full order history page:

```tsx
const OrderHistory = () => {
  const { user } = useAuth();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const res = await api.get(`/orders/user/${user!.id}`);
      return res.data.orders || [];
    },
    enabled: !!user?.id,
  });

  // Render: loading skeleton → empty state → orders list
  // Each order row: Order ID, date, status badge, total, "View Details" button
};
```

**Key features:**
- Paginated list of orders (newest first)
- Status badge with color coding (Pending=yellow, Delivered=green, Cancelled=red)
- "View Details" link to `/orders/:orderId`
- Empty state when no orders
- Skeleton loading state

---

### BUG-05: `Wishlist.tsx` — Stub page (COMPLETELY BROKEN)

**File:** `client/src/pages/user/Wishlist.tsx` (only 736 bytes)

**Problem:** Wishlist shows nothing. Users can't manage their saved products.

**Fix:** Implement full wishlist page using the existing `WishlistTable` component:

```tsx
const Wishlist = () => {
  const { user } = useAuth();
  const { updateWishlistCount } = useCart();

  const { data: wishlistData, isLoading, refetch } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await api.get(`/wishlist/${user!.id}`);
      return res.data.wishlist || null;
    },
    enabled: !!user?.id,
  });

  // When loaded, update global wishlist count
  // Render: WishlistTable component already exists at
  //   client/src/components/user/WishlistTable.tsx
};
```

---

### BUG-06: `OrderConfirmation.tsx` — Stub page

**File:** `client/src/pages/user/OrderConfirmation.tsx` (only 877 bytes)

**Problem:** After a successful Razorpay payment, users are redirected to `/order-history` immediately. The `OrderConfirmation` page is never used but should be shown.

**Fix:** 
1. After successful checkout in `Checkout.tsx`, navigate to `/order-confirmation/:orderId` instead of `/order-history`
2. Implement `OrderConfirmation.tsx` to show:
   - Success animation (checkmark SVG with CSS animation)
   - Order ID
   - "Thank you for your order" message
   - Estimated delivery
   - Links to "View Order" and "Continue Shopping"

---

## 🆕 New Features

### FEAT-01: Cart — Optimistic UI for quantity changes

**File:** `client/src/pages/user/Cart.tsx`

**Problem:** Clicking +/- on quantity waits for server response. Feels slow.

**Fix:** Update cart state immediately, then sync to server in background. On error, revert:

```typescript
const handleQuantityChange = async (id: string, amount: number) => {
  // 1. Optimistically update UI
  setCart(prev => prev.map(item => 
    (item.productId.id === id || item.productId._id === id)
      ? { ...item, quantity: Math.max(1, item.quantity + amount) }
      : item
  ));
  
  // 2. Sync to server
  try {
    await api.put(`/cart/${user.id}`, { productId: id, quantity: newQty });
  } catch {
    // 3. Revert on error
    setCart(prevCart); // restore previous state
    toast.error('Failed to update cart');
  }
};
```

### FEAT-02: Checkout — Address management inline

**Problem:** "Add New Address" shows/hides a form inline in checkout. If the form submit fails, the state is confusing.

**Fix:** Open the address form in a modal instead of inline toggle.

### FEAT-03: Cart — Item count badge sync after add-to-cart

**Problem:** When a product is added from `ProductDetails.tsx`, the cart count in the header updates. But if the user goes back to `ProductDetails` and adds again, it should increment, not reset.

**Fix:** The current code calls `updateCartCount(response.data.items.length)` ✅ — this is correct. Verify the API returns the updated cart items list.

---

## 📁 Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `client/src/pages/user/OrderDetails.tsx` | **Critical Bug Fix** | Remove all `$numberDecimal` references |
| `client/src/pages/user/Cart.tsx` | **Bug Fix** | Fix discount calculation; add optimistic UI |
| `client/src/pages/user/Checkout/Checkout.tsx` | **Bug Fix** | Fix stock check error handling; fix discount calc |
| `client/src/pages/user/OrderHistory.tsx` | **Full Rebuild** | Implement complete order history page |
| `client/src/pages/user/Wishlist.tsx` | **Full Rebuild** | Implement wishlist management page |
| `client/src/pages/user/OrderConfirmation.tsx` | **Full Rebuild** | Implement order confirmation page |
| `client/src/utils/offer.ts` | **New File** | Shared offer discount calculation utility |
| `client/src/routes/UserRoutes.tsx` | **Update** | Change post-checkout redirect target |

---

## ✅ Acceptance Criteria

- [ ] `OrderDetails` page loads without crashes for any order
- [ ] Cart offer discount is correctly capped at `maxDiscount`
- [ ] Same discount correctly shown on Checkout summary
- [ ] Failed stock check during checkout shows a clear error and prevents payment
- [ ] `OrderHistory` shows all user orders with correct status badges
- [ ] `Wishlist` page shows all saved products with remove functionality
- [ ] `OrderConfirmation` page is shown after successful payment
- [ ] Cart quantity +/- feels instant (optimistic update)
