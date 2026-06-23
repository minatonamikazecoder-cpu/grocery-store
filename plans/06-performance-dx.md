# Plan 06 — Performance, DX & Code Quality

**Priority:** 🟢 Low | **Estimated effort:** 2-3 days

---

## 🎯 Goal

Improve app performance, developer experience, eliminate code duplication, add proper TypeScript types, and establish testing patterns.

---

## ⚡ Part A: Frontend Performance

### PERF-01: Migrate all data fetching to React Query

**Problem:** Only `Shop.tsx` uses `useQuery`. All other pages use `useEffect + useState + api.get()`. This means:
- No automatic caching — same data refetched on every visit
- No stale-while-revalidate behavior
- No background refetch on window focus (though disabled globally)
- No deduplication of parallel requests

**Pages to migrate to React Query:**
| Page | Current | Target |
|------|---------|--------|
| `Home.tsx` | 5x `useEffect` fetches | 5x `useQuery` with shared keys |
| `Cart.tsx` | `useEffect` | `useQuery` + `useMutation` |
| `ProductDetails.tsx` | `useEffect` | `useQuery` |
| `OrderDetails.tsx` | `useEffect` | `useQuery` |
| `OrderHistory.tsx` | (new page) | `useQuery` from the start |

**Migration example for Cart:**
```typescript
// BEFORE
const [cart, setCart] = useState([]);
useEffect(() => {
  api.get(`/cart/${user.id}`).then(res => setCart(res.data.items));
}, [user.id]);

// AFTER
const { data: cart = [], isLoading } = useQuery({
  queryKey: ['cart', user?.id],
  queryFn: () => api.get(`/cart/${user!.id}`).then(r => r.data.items),
  enabled: !!user?.id,
  staleTime: 30_000, // consider fresh for 30s
});
```

**Cart mutations with cache invalidation:**
```typescript
const updateCartMutation = useMutation({
  mutationFn: ({ productId, quantity }) => 
    api.put(`/cart/${user.id}`, { productId, quantity }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
  },
});
```

---

### PERF-02: Code splitting on admin routes

**File:** `client/src/routes/AdminRoutes.tsx`

**Problem:** All admin components are imported statically. The huge admin bundle loads even for regular users who never visit `/admin`.

**Fix:** Use `React.lazy` + `Suspense`:
```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Products = lazy(() => import('../pages/admin/Products'));
// ... all admin pages

// In JSX
<Suspense fallback={<AdminLoader />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    {/* ... */}
  </Routes>
</Suspense>
```

This defers loading all admin code until the `/admin` route is first accessed.

---

### PERF-03: Image optimization

**Problem:** Product images are loaded at full resolution. No lazy loading.

**Fix:**
1. Add `loading="lazy"` to all `<img>` tags below the fold
2. Add `width` and `height` attributes to prevent layout shift
3. Use `object-fit: cover` consistently
4. Consider adding Cloudinary URL transforms for smaller thumbnails

```tsx
// In ProductCard
<img
  src={product.productImage}
  alt={product.productName}
  loading="lazy"
  width={300}
  height={200}
  style={{ objectFit: 'cover', width: '100%', height: '200px' }}
/>
```

---

### PERF-04: Debounce search input

**Files:** `client/src/contexts/SearchContext.tsx`, `client/src/components/user/Header.tsx`

**Problem:** The search filter runs on every keystroke.

**Fix:** Debounce the search query:
```typescript
import { useDeferredValue } from 'react';

// In SearchContext or Shop.tsx
const deferredQuery = useDeferredValue(searchQuery);
// Use deferredQuery instead of searchQuery for filtering
```

Or use a debounce hook:
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

---

## 🔧 Part B: Code Quality

### CODE-01: Eliminate TypeScript `any`

**Problem:** Several files use `any` type liberally:
```typescript
// Cart.tsx
const [cart, setCart] = useState<any[]>([]);
const [offers, setOffers] = useState<any[]>([]);
const [appliedOffer, setAppliedOffer] = useState<any>(null);
```

**Fix:** Define proper TypeScript interfaces:

```typescript
// client/src/types/index.ts — add missing types
export interface CartItem {
  id: string;
  productId: {
    id: string;
    _id?: string;
    productName: string;
    productImage: string;
    salePrice: number;
    discount: number;
    stock?: number;
  };
  quantity: number;
}

export interface Offer {
  id: string;
  offerCode: string;
  discount: number;
  minimumOrder: number;
  maxDiscount: number;
  activeStatus: boolean;
  startDate: string;
  endDate: string;
}

export interface OrderItem {
  productId: { id: string; productName: string; productImage: string };
  quantity: number;
  price: number;
  discount: number;
}

export interface Order {
  id: string;
  _id?: string;
  userId: string;
  orderDate: string;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  shippingCharge: number;
  paymentMode: string;
  paymentStatus: string;
}
```

### CODE-02: Extract shared offer utility

Already identified in Plan 02. Create:

```typescript
// client/src/utils/offer.ts
import { Offer } from '../types';

export function calculateOfferDiscount(subtotal: number, offer: Offer): number {
  if (subtotal < offer.minimumOrder) return 0;
  const raw = subtotal * (offer.discount / 100);
  return Math.min(raw, offer.maxDiscount);
}

export function isOfferApplicable(subtotal: number, offer: Offer): boolean {
  return subtotal >= offer.minimumOrder;
}
```

### CODE-03: Remove dead code

Files to audit for unused code:
- `client/src/pages/user/Home.tsx` — `Categories` component is commented out; either restore or remove
- `client/src/pages/user/OrderDetails.tsx` — billing address block is commented out
- `client/test-bs.tsx` — test file in src root, should be in `__tests__/`
- `client/test-bs.js` — 184KB test file in client root, should be removed or moved

### CODE-04: Custom hooks for repeated patterns

Extract repeated fetch patterns into custom hooks:

```typescript
// client/src/hooks/useCart.ts (rename from context)
// client/src/hooks/useOrderHistory.ts
// client/src/hooks/useWishlist.ts
// client/src/hooks/useProduct.ts
// client/src/hooks/useOffers.ts
```

---

## 🧪 Part C: Testing

### TEST-01: Server — Extend existing test suite

**File:** `server/tests/app.test.js`

Currently minimal. Add tests for critical flows:

```typescript
// server/tests/auth.test.ts
describe('POST /users/register', () => {
  it('should register a new user', async () => { ... });
  it('should fail with duplicate email', async () => { ... });
  it('should fail with missing fields', async () => { ... });
});

describe('POST /users/login', () => {
  it('should login with valid credentials', async () => { ... });
  it('should fail with wrong password', async () => { ... });
  it('should fail for inactive account', async () => { ... });
});
```

### TEST-02: Server — Cart and Order tests

```typescript
// server/tests/order.test.ts
describe('POST /orders/checkout', () => {
  it('should fail when cart is empty', async () => { ... });
  it('should fail when stock is insufficient', async () => { ... });
  it('should create order and clear cart', async () => { ... });
});
```

### TEST-03: Client — Component tests

Setup Vitest + @testing-library/react (Vite project already supports Vitest):

```typescript
// client/src/__tests__/Cart.test.tsx
describe('Cart discount calculation', () => {
  it('should cap discount at maxDiscount', () => {
    const offer: Offer = { discount: 20, minimumOrder: 100, maxDiscount: 50 };
    expect(calculateOfferDiscount(500, offer)).toBe(50); // 100 raw, capped at 50
  });
  
  it('should return 0 if subtotal below minimum', () => {
    const offer: Offer = { discount: 20, minimumOrder: 100, maxDiscount: 50 };
    expect(calculateOfferDiscount(50, offer)).toBe(0);
  });
});
```

---

## 🔨 Part D: Developer Experience

### DX-01: Environment variable documentation

**File:** `client/.env.example` — Ensure it documents all required variables:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

**File:** `server/.env` — Ensure it has examples for all vars. Create `server/.env.example`.

### DX-02: Add NPM scripts for development

**File:** Root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "test": "cd server && npm test",
    "lint": "cd client && npm run lint && cd ../server && npm run lint"
  }
}
```

### DX-03: Path aliases

**File:** `client/tsconfig.json` — Add path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@pages/*": ["./src/pages/*"],
      "@utils/*": ["./src/utils/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

**File:** `client/vite.config.ts`:

```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      // etc.
    }
  }
});
```

---

## 📁 Files to Modify

| File | Change |
|------|--------|
| `client/src/routes/AdminRoutes.tsx` | Code split with React.lazy |
| `client/src/pages/user/Home.tsx` | Migrate to useQuery |
| `client/src/pages/user/Cart.tsx` | Migrate to useQuery + useMutation |
| `client/src/pages/user/ProductDetails.tsx` | Migrate to useQuery |
| `client/src/types/index.ts` | Add CartItem, Offer, OrderItem, Order types |
| `client/src/utils/offer.ts` | New shared offer utility |
| `client/src/hooks/` | New custom hooks |
| `client/tsconfig.json` | Path aliases |
| `client/vite.config.ts` | Path aliases |
| `client/.env.example` | Document all env vars |
| `server/.env.example` | **New** — Document all server env vars |
| `server/tests/auth.test.ts` | **New** — Auth tests |
| `server/tests/order.test.ts` | **New** — Order tests |
| `package.json` (root) | Unified dev scripts |

---

## ✅ Acceptance Criteria

- [ ] Admin bundle is code-split — not loaded for regular users
- [ ] Home, Cart, ProductDetails use React Query with cache
- [ ] Cart mutations are optimistic
- [ ] No `any` types in Cart, Checkout, OrderDetails, or ProductDetails
- [ ] `calculateOfferDiscount` utility has unit tests passing
- [ ] Auth flow has at least 5 server-side tests
- [ ] Search input is debounced (300ms)
- [ ] Images below the fold use `loading="lazy"`
- [ ] Path aliases work in imports (`@/utils/api` instead of `../../utils/api`)
- [ ] Running `npm run dev` from root starts both client and server
