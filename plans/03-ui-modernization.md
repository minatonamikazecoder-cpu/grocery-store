# Plan 03 — UI/UX Complete Modernization

**Priority:** 🟡 High | **Estimated effort:** 5-7 days

---

## 🎯 Goal

Transform PureBite from a Bootstrap-heavy, visually dated app into a premium, modern grocery e-commerce experience. This is the largest plan — every user-facing page gets attention.

---

## 🎨 Step 1: Design System Foundation

### 1.1 — Add Inter Font (Google Fonts)

**File:** `client/index.html`

Add to `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### 1.2 — CSS Custom Properties (Design Tokens)

**File:** `client/src/App.css` — Add at the very top:

```css
:root {
  /* Brand Colors */
  --primary:        #3BB77E;
  --primary-dark:   #2DA16C;
  --primary-darker: #1F8A58;
  --primary-light:  #DEF9EC;
  --primary-faint:  #F4FBF8;
  
  /* Accent */
  --accent:         #F7941D;
  --accent-light:   #FEF3E2;
  
  /* Semantic */
  --danger:         #EF4444;
  --danger-light:   #FEF2F2;
  --warning:        #F59E0B;
  --warning-light:  #FFFBEB;
  --info:           #3B82F6;
  --info-light:     #EFF6FF;
  
  /* Text */
  --text-dark:      #1E293B;
  --text-body:      #4F5D75;
  --text-muted:     #94A3B8;
  --text-light:     #CBD5E1;
  
  /* Backgrounds */
  --bg-page:        #F8FAFC;
  --bg-white:       #FFFFFF;
  --bg-subtle:      #F1F5F9;
  
  /* Borders */
  --border:         #E2E8F0;
  --border-focus:   #3BB77E;
  
  /* Typography */
  --font:           'Inter', system-ui, -apple-system, sans-serif;
  
  /* Spacing (8px grid) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;
  --space-16: 64px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 9999px;
  
  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04);
  --shadow-xl: 0 20px 40px rgba(0,0,0,0.1);
  --shadow-green: 0 4px 14px rgba(59, 183, 126, 0.25);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font);
  color: var(--text-body);
  background: var(--bg-page);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

---

## 🏠 Step 2: Home Page Redesign

**File:** `client/src/pages/user/Home.tsx`

### 2.1 — Hero/Carousel

The current carousel is functional but plain. Enhance with:
- Overlay gradient for text readability
- Animated text entrance (CSS `@keyframes slideInUp`)
- Dot indicators styled as pills (not Bootstrap default)
- Auto-advance every 4 seconds

### 2.2 — Un-comment & Style the Categories Section

The `<Categories>` component is commented out. Restore and redesign:

```tsx
// New Categories design: horizontal scrollable row with emoji/icon + name
// Each category = rounded card with gradient background, hover lift effect
const Categories = ({ categories }) => (
  <section className="categories-section">
    <div className="container">
      <h2 className="section-title">Shop by Category</h2>
      <div className="categories-scroll">
        {categories.map(cat => (
          <Link key={cat.id} to={`/shop?category=${cat.id}`} className="category-chip">
            <div className="category-img-wrap">
              <img src={cat.image} alt={cat.name} />
            </div>
            <span>{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
```

### 2.3 — Section Headers

Replace plain `<h4>` with styled section headers:
```tsx
<div className="section-header">
  <h2 className="section-title">Trending Products</h2>
  <Link to="/shop" className="section-link">View all <i className="fa fa-arrow-right" /></Link>
</div>
```

### 2.4 — Promo Banners

Current: raw `<img>` inside a `<div>`. Redesign to use CSS for the overlay, not inline text:
- Image with `object-fit: cover`
- Gradient overlay from bottom
- Text positioned absolutely
- Smooth hover zoom on image

---

## 🃏 Step 3: Product Card Redesign

**File:** `client/src/components/user/ProductList.tsx`

The `ProductCard` component (rendered inside ProductList) needs a full visual update:

```
Current: Basic Bootstrap card with minimal styling
Target:  Premium card with:
  - Rounded corners (var(--radius-md))
  - Subtle shadow + hover lift (transform: translateY(-4px))
  - Category badge on image (top-left)
  - Discount badge on image (top-right, pill, accent color)
  - Image with smooth hover zoom (overflow: hidden + transform)
  - Product name with line-clamp (2 lines max)
  - Star rating with exact decimal (e.g., 4.3 ★)
  - Crossed-out original price + discounted price
  - "Add to Cart" button (full width, primary color, hover effect)
  - Wishlist heart icon (top-right, toggle)
```

**CSS for hover card:**
```css
.product-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-white);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.product-card .img-wrap {
  overflow: hidden;
  height: 200px;
  background: var(--primary-faint);
}

.product-card .img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.product-card:hover .img-wrap img {
  transform: scale(1.05);
}
```

---

## 🔑 Step 4: Login & Register Pages

**Files:** `Login.tsx`, `Register.tsx`

**Target design:**
- Full-height split layout: left = form, right = illustration/brand panel
- Form inside a glassmorphism card (semi-transparent, backdrop-blur)
- Floating labels or clearly styled label + input pairs
- Password field with show/hide eye icon
- Social proof on right panel: "Join 10,000+ customers"
- Smooth entrance animation on mount

**CSS for auth card:**
```css
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg-page);
}

@media (max-width: 768px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-brand-panel { display: none; }
}

.auth-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--space-10);
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.4s ease;
}

.auth-brand-panel {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-darker) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  color: white;
}
```

---

## 🛍️ Step 5: Shop Page & Filter UI

**File:** `client/src/pages/user/Shop.tsx`

**Current:** Plain radio buttons in a collapsible div.
**Target:** 
- Sidebar filter panel (on desktop) / bottom sheet drawer (on mobile)
- Filter chips at the top showing active filters
- Category filter added (currently missing)
- Price range slider instead of radio buttons
- "X active filters" badge on the filter button

**Filter sidebar:**
```css
.filter-sidebar {
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  position: sticky;
  top: 80px; /* below fixed header */
}

.filter-section-title {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--primary-light);
  color: var(--primary-dark);
  border-radius: var(--radius-pill);
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 500;
}
```

---

## 📦 Step 6: Product Details Page

**File:** `client/src/pages/user/ProductDetails.tsx`

**Current:** Single image + text layout.
**Target:**
- Sticky product image on left (on desktop)
- Rich product info panel on right
- Image zoom on hover (CSS only)
- Breadcrumb with proper styling
- Stock badge ("In Stock ✓" or "Low Stock ⚠️" or "Out of Stock ✗")
- "Add to Wishlist" button alongside "Add to Cart"
- Reviews section below with star breakdown (5★: 40%, 4★: 30%, etc.)
- "Related Products" carousel at the bottom

---

## 🛒 Step 7: Cart Page

**File:** `client/src/pages/user/Cart.tsx`

**Current:** HTML table layout.
**Target:**
- Modern card-based layout (not a table) for mobile-friendliness
- Each item = a card with image left + details right + quantity selector
- Offer section styled as a featured promo box
- Order summary in a sticky right-side panel on desktop
- "Continue Shopping" link back to shop

---

## 💳 Step 8: Checkout Page

**File:** `client/src/pages/user/Checkout/Checkout.tsx`

**Target:**
- 2-column layout: Address selection left, Order Summary right
- Address cards with radio selection and a green border when selected
- "Add New Address" slides in as an inline section (not a modal)
- Order summary sticky on scroll
- Clear "Place Order" CTA with lock icon and "Secure Payment" label

---

## 📜 Step 9: Order History & Order Details

**Files:** `OrderHistory.tsx`, `OrderDetails.tsx`

**Order History:**
- Clean table with Order ID, Date, Status badge, Total, Action
- Status badges: pill shape, color-coded
- Pagination controls

**Order Details:**
- Timeline/stepper showing order status progression
- Product items with images
- Two-column layout: Order info left, Shipping info right
- Print button for invoice

---

## 🧭 Step 10: Header & Navigation

**File:** `client/src/components/user/Header.tsx`

**Target improvements:**
- Sticky header with blur backdrop on scroll (`backdrop-filter: blur(12px)`)
- Search bar expands on focus
- Cart badge with bounce animation when count changes
- Mobile hamburger menu → slide-in drawer (not Bootstrap collapse)
- User avatar dropdown for profile/logout

---

## 📁 Files to Modify

| File | Change |
|------|--------|
| `client/index.html` | Add Inter font |
| `client/src/App.css` | Full design token system |
| `client/src/pages/user/Home.tsx` | Hero, categories, section headers |
| `client/src/components/user/ProductList.tsx` | Premium product card |
| `client/src/pages/user/Login.tsx` | Split-panel auth design |
| `client/src/pages/user/Register.tsx` | Split-panel auth design |
| `client/src/pages/user/Shop.tsx` | Sidebar filter, category filter |
| `client/src/pages/user/ProductDetails.tsx` | Rich product page |
| `client/src/pages/user/Cart.tsx` | Card-based cart UI |
| `client/src/pages/user/Checkout/Checkout.tsx` | Modern checkout layout |
| `client/src/pages/user/OrderHistory.tsx` | Clean order table |
| `client/src/pages/user/OrderDetails.tsx` | Timeline status, product list |
| `client/src/components/user/Header.tsx` | Sticky + blur header |
| `client/src/components/user/Footer.tsx` | Modern footer |

---

## ✅ Acceptance Criteria

- [ ] App uses Inter font throughout
- [ ] All CSS variables defined and used consistently
- [ ] Product cards show hover lift + image zoom
- [ ] Auth pages use split-panel layout with brand side
- [ ] Shop has sidebar/collapsible filter with category filter
- [ ] Product details shows stock status and wishlist button
- [ ] Cart uses card-based layout (no raw table)
- [ ] Header becomes slightly frosted/blurred on scroll
- [ ] All pages render correctly on mobile (375px+)
- [ ] No placeholder images — use real uploaded images or SVG fallback
