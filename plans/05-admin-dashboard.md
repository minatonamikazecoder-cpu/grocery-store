# Plan 05 — Admin Dashboard Fixes & Enhancements

**Priority:** 🟠 Medium | **Estimated effort:** 3-4 days

---

## 🎯 Goal

Fix broken/stub admin pages, improve the overall admin UX, standardize how admin pages interact with the API, and add missing admin capabilities.

---

## 🐛 Bugs to Fix

### BUG-01: `Orders.tsx` — Stub page (763 bytes)

**File:** `client/src/pages/admin/Orders.tsx`

**Problem:** The admin orders listing page is a stub. Admins cannot view all orders.

**Fix:** Implement full admin orders page:

```tsx
const AdminOrders = () => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: async () => {
      const res = await api.get(`/orders?page=${page}&limit=10`);
      return res.data;
    }
  });

  // Render DataTable with columns:
  // Order ID | Customer | Date | Status | Total | Payment Mode | Actions
  // Actions: View, Update Status
};
```

**Status badge colors:**
- `Pending` → yellow
- `Processing` → blue
- `Shipped` → purple
- `Delivered` → green
- `Cancelled` → red

---

### BUG-02: `ViewProduct.tsx` and `ViewOrder.tsx` — Inconsistent data access

**Files:** `client/src/pages/admin/ViewProduct.tsx`, `client/src/pages/admin/ViewOrder.tsx`

**Problem:** These pages may be accessing data fields with the `$numberDecimal` pattern (same as OrderDetails bug). Audit and fix.

**Fix:** Check all `parseFloat(x["$numberDecimal"])` patterns and replace with `Number(x)`.

---

### BUG-03: `AddOrder.tsx` — N+1 product lookups

**File:** `client/src/pages/admin/AddOrder.tsx`

**Problem:** When admin adds products to an order, each product is looked up individually. This likely causes multiple sequential API calls.

**Fix:** Fetch all needed products in a single batch request.

---

## 🆕 Admin Enhancements

### ENH-01: Dashboard — Real-time Stats

**File:** `client/src/pages/admin/Dashboard.tsx`

**Current:** Shows static or minimal stats.
**Target:** 4 KPI cards + charts:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Total Orders│  │  Revenue    │  │  Products   │  │   Users     │
│    1,284    │  │  ₹2,45,000  │  │    324      │  │    892      │
│  +12% MoM   │  │  +8% MoM   │  │  Active     │  │  This month │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

+ Recent Orders table (last 5)
+ Top Products by sales (last 7 days)
```

**API:** `GET /dashboard` — verify this endpoint returns all needed data.

### ENH-02: Products — Bulk Actions

**File:** `client/src/pages/admin/Products.tsx`

Add checkbox selection + "Mark Inactive" bulk action for selected products.

### ENH-03: Orders — Status Update Flow

**File:** `client/src/pages/admin/UpdateOrder.tsx`

**Current:** Admin updates order using a full form.
**Target:** Simpler status dropdown + "Update Status" button. Other fields (address, products) should be read-only after order is placed.

Add a dropdown for status progression:
```
Pending → Processing → Shipped → Delivered
           ↘ Cancelled (any stage)
```

Only allow forward progression (can't go from Delivered back to Pending).

### ENH-04: Reviews — Reply Feature

**File:** `client/src/pages/admin/Reviews.tsx`

The admin can currently view reviews. Add inline reply functionality:
- Each review row has an expandable "Reply" section
- Admin types a reply and saves
- Frontend shows reply below the customer review

This requires the `review.controller.ts` to have a `PATCH /reviews/:id/reply` endpoint.

**New API endpoint:**
```typescript
export const replyToReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  
  const reviewRepo = AppDataSource.getRepository(Review);
  const review = await reviewRepo.findOneBy({ id });
  if (!review) throw new ApiError(404, 'Review not found');
  
  review.reply = reply;
  review.replier = 'Admin';
  review.replyDate = new Date();
  await reviewRepo.save(review);
  
  res.json({ message: 'Reply saved', review });
});
```

### ENH-05: Banners — Preview Before Upload

**File:** `client/src/pages/admin/AddBanner.tsx`, `UpdateBanner.tsx`

**Current:** Upload image → save → see in storefront.
**Target:** Show a live preview of the uploaded image before saving.

```tsx
const [preview, setPreview] = useState<string | null>(null);

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setPreview(URL.createObjectURL(file));
  }
};

// In JSX:
{preview && (
  <div className="banner-preview">
    <img src={preview} alt="Preview" />
  </div>
)}
```

### ENH-06: Users — Search & Filter

**File:** `client/src/pages/admin/Users.tsx`

Add search by name/email and filter by status (Active/Inactive/Deleted).

The `getAllUsers` endpoint already supports pagination. Add search:
```typescript
// In user.controller.ts getAllUsers
const { search, status } = req.query;
// Add to queryBuilder: LIKE name OR email, filter by status
```

---

## 🎨 Admin UI Improvements

### UI-01: Consistent DataTable styling

**All admin list pages use `react-data-table-component`.** Ensure consistent customStyles applied globally:

```typescript
// client/src/utils/adminTableStyles.ts
export const tableCustomStyles = {
  headRow: {
    style: {
      backgroundColor: '#F8F9FA',
      borderBottom: '2px solid #E2E8F0',
      fontWeight: '700',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#4F5D75',
    },
  },
  rows: {
    style: {
      fontSize: '0.875rem',
      color: '#253D4E',
      transition: 'background-color 0.15s ease',
      '&:hover': { backgroundColor: '#F4FBF8' },
    },
  },
  pagination: {
    style: {
      borderTop: '1px solid #E2E8F0',
      padding: '12px 0',
    },
  },
};
```

### UI-02: Admin form improvements

**All `Add*.tsx` and `Update*.tsx` pages** share common patterns. Create a `FormField` component:

```tsx
// client/src/components/admin/FormField.tsx
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const FormField = ({ label, required, error, children }: FormFieldProps) => (
  <div className="mb-4">
    <label className="admin-form-label">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    {children}
    {error && <p className="text-danger mt-1 small">{error}</p>}
  </div>
);
```

### UI-03: Sidebar active state

**File:** `client/src/layouts/AdminLayout.tsx`

Ensure the sidebar highlights the current active route. Use `useLocation()` and compare pathname.

### UI-04: Admin action confirmation dialogs

**Problem:** Delete buttons (products, users, banners) execute immediately without confirmation.

**Fix:** Add a reusable confirmation dialog/modal:

```tsx
// client/src/components/admin/ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}
```

---

## 📁 Files to Modify

| File | Change |
|------|--------|
| `client/src/pages/admin/Orders.tsx` | **Full Rebuild** — Admin orders list |
| `client/src/pages/admin/Dashboard.tsx` | **Enhancement** — KPI cards + recent orders |
| `client/src/pages/admin/Reviews.tsx` | **Enhancement** — Inline reply |
| `client/src/pages/admin/UpdateOrder.tsx` | **Enhancement** — Status-only update |
| `client/src/pages/admin/AddBanner.tsx` | **Enhancement** — Image preview |
| `client/src/pages/admin/UpdateBanner.tsx` | **Enhancement** — Image preview |
| `client/src/pages/admin/Users.tsx` | **Enhancement** — Search + filter |
| `client/src/utils/adminTableStyles.ts` | **New** — Shared DataTable styles |
| `client/src/components/admin/FormField.tsx` | **New** — Reusable form field |
| `client/src/components/admin/ConfirmDialog.tsx` | **New** — Confirmation dialog |
| `server/src/controllers/review.controller.ts` | Update — Add reply endpoint |
| `server/src/routes/review.ts` | Update — Register reply route |
| `server/src/controllers/user.controller.ts` | Update — Search support in getAllUsers |

---

## ✅ Acceptance Criteria

- [ ] Admin can view all orders with status, customer, and totals
- [ ] Admin can filter orders by status
- [ ] Order status update follows valid progressions (Pending → Processing → Shipped → Delivered)
- [ ] Admin can reply to reviews inline
- [ ] Dashboard shows real KPI data (orders count, revenue, users, products)
- [ ] Banner upload shows preview before saving
- [ ] Delete actions require confirmation dialog
- [ ] All admin DataTables use consistent styling
- [ ] Admin search for users works by name/email
