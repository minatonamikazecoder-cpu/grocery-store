# Plan 01 — Authentication & User Flows

**Priority:** 🔴 Critical | **Estimated effort:** 2-3 days

---

## 🎯 Goal

Fix all broken auth flows, improve security, and make the full auth journey (register → verify → login → forgot password → reset) robust, tested, and user-friendly.

---

## 🐛 Bugs to Fix

### BUG-01: `api.ts` — 401 Interceptor causes hard page reload

**File:** `client/src/utils/api.ts` (line 32)

**Problem:** On a 401 response, the code does `window.location.href = '/login'` which is a hard browser navigation. This destroys React state, breaks React Query cache, and doesn't sync with `AuthContext`.

**Fix:**
```typescript
// BEFORE (broken)
window.location.href = '/login';

// AFTER (correct approach)
// The interceptor should dispatch a custom event that AuthContext listens to,
// or use a ref to the navigate function injected at app level.
// Simplest: emit a custom event
window.dispatchEvent(new CustomEvent('auth:logout'));
```

In `AuthContext.tsx`, listen to the event:
```typescript
useEffect(() => {
  const handler = () => {
    logout(); // clears state + localStorage
    // React Router's navigate is called from a hook in App.tsx
  };
  window.addEventListener('auth:logout', handler);
  return () => window.removeEventListener('auth:logout', handler);
}, []);
```

In `App.tsx` or a wrapper component, listen and navigate:
```typescript
// Use useNavigate inside BrowserRouter context
const navigate = useNavigate();
useEffect(() => {
  const handler = () => navigate('/login');
  window.addEventListener('auth:logout', handler);
  return () => window.removeEventListener('auth:logout', handler);
}, [navigate]);
```

---

### BUG-02: `Login.tsx` — No password visibility toggle

**File:** `client/src/pages/user/Login.tsx`

**Problem:** Users cannot see what they're typing in the password field.

**Fix:** Add `showPassword` state and an eye icon button:
```tsx
const [showPassword, setShowPassword] = useState(false);
// ...
<div style={{ position: 'relative' }}>
  <input
    type={showPassword ? 'text' : 'password'}
    // ...existing props
  />
  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? 'Hide password' : 'Show password'}
  >
    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
  </button>
</div>
```

---

### BUG-03: `Register.tsx` — No password confirmation field

**File:** `client/src/pages/user/Register.tsx`

**Problem:** Users register with a password but there's no confirm-password field. Typos lead to locked accounts.

**Fix:** Add `confirmPassword` field to the form state and validate match before submitting.

---

### BUG-04: `OtpVerification.tsx` — No auto-advance on OTP input

**File:** `client/src/pages/user/OtpVerification.tsx`

**Problem:** 6-digit OTP entry is a single input. Modern UX uses 6 separate single-character inputs that auto-advance.

**Fix:** Refactor to use 6 individual `input[maxLength=1]` elements that auto-focus the next input on keypress and support paste.

---

### BUG-05: `EmailVerification.tsx` — No resend capability

**File:** `client/src/pages/user/EmailVerification.tsx`

**Problem:** After registration, if the email doesn't arrive, users have no way to resend the verification email.

**Fix:** Add a "Resend verification email" button with a 60-second cooldown that calls a new API endpoint `/users/resend-verification`.

**New API endpoint needed:** `POST /users/resend-verification` with body `{ email }`.

---

### BUG-06: `ForgotPassword.tsx` — Flow jumps directly to reset without OTP

**File:** `client/src/pages/user/ForgotPassword.tsx`

**Problem:** Review the current forgot-password flow to ensure it's: `Enter Email → Send OTP → Verify OTP → Reset Password`. If any step is skipped, the flow is insecure.

**Fix:** Ensure the flow is sequential and each step validates the previous one is complete.

---

## 🆕 New Features

### FEAT-01: `VerifyEmail.tsx` — Handle token expiry gracefully

**File:** `client/src/pages/user/VerifyEmail.tsx` (currently 1376 bytes — very thin)

**Problem:** If the JWT verification token expires (24h), users see a generic error with no actionable path.

**Fix:** Parse the API error response. If expired, show a "Request new verification email" button.

---

### FEAT-02: Google OAuth flow completion

**File:** `server/src/controllers/user.controller.ts` — `googleLogin` function

**Problem:** The `googleLogin` endpoint returns `isNewUser: true` for new users but the client must then separately call another endpoint to complete profile (first/last name, mobile). The flow is incomplete.

**Fix:** The server should require Google users to complete their profile on first login. Add a `isProfileComplete` check on the User model and guard protected routes accordingly.

---

## 🔒 Security Improvements

### SEC-01: Remove password from JWT payload

**File:** `server/src/controllers/user.controller.ts`

**Current JWT payload:** `{ id, role }` ✅ Good — password not in token.

**Action:** Verify that no route accidentally returns `password` field in responses. Add a centralized `sanitizeUser()` utility.

### SEC-02: Token refresh strategy

**Problem:** JWT expires in 7 days. If compromised, it's valid for the full period.

**Options:**
- Implement refresh tokens with shorter-lived access tokens (15min)
- Or at minimum, add a server-side token blacklist for logout

**Recommended:** Add `POST /users/logout` endpoint that invalidates the token.

---

## 📁 Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `client/src/utils/api.ts` | Bug Fix | Replace `window.location.href` with custom event |
| `client/src/contexts/AuthContext.tsx` | Enhancement | Listen for auth:logout event |
| `client/src/pages/user/Login.tsx` | Enhancement | Add password visibility toggle |
| `client/src/pages/user/Register.tsx` | Bug Fix | Add confirm password field |
| `client/src/pages/user/OtpVerification.tsx` | Enhancement | 6-digit auto-advance OTP input |
| `client/src/pages/user/EmailVerification.tsx` | Enhancement | Add resend button with cooldown |
| `client/src/pages/user/VerifyEmail.tsx` | Enhancement | Handle expired token gracefully |
| `server/src/controllers/user.controller.ts` | Enhancement | Add resend-verification endpoint, sanitizeUser util |
| `server/src/routes/user.ts` | Enhancement | Register new routes |

---

## ✅ Acceptance Criteria

- [ ] Login with wrong password shows a clear error toast
- [ ] Login redirects correctly for Admin vs User roles
- [ ] 401 on any protected page → logout + redirect to /login (without hard reload)
- [ ] Register with mismatched passwords shows inline error
- [ ] OTP input supports paste and auto-advances between digits
- [ ] Forgot password → OTP → Reset Password flow works end-to-end
- [ ] Expired verification link shows friendly message with resend option
- [ ] Password fields have show/hide toggles on Login and Register
