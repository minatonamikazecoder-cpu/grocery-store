const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/admin/AddBanner.tsx',
  'src/pages/admin/AddCategory.tsx',
  'src/pages/admin/AddOffer.tsx',
  'src/pages/admin/AddOrder.tsx',
  'src/pages/admin/AddProduct.tsx',
  'src/pages/admin/AddReview.tsx',
  'src/pages/admin/AddToCart.tsx',
  'src/pages/admin/AddUser.tsx',
  'src/pages/admin/Cart.tsx',
  'src/pages/admin/Categories.tsx',
  'src/pages/admin/EmailVerification.tsx',
  'src/pages/admin/MyProfile.tsx',
  'src/pages/admin/Responses.tsx',
  'src/pages/admin/Reviews.tsx',
  'src/pages/admin/SiteSettings.tsx',
  'src/pages/admin/UpdateBanner.tsx',
  'src/pages/admin/UpdateCart.tsx',
  'src/pages/admin/UpdateCategory.tsx',
  'src/pages/admin/UpdateOffer.tsx',
  'src/pages/admin/UpdateOrder.tsx',
  'src/pages/admin/UpdateProduct.tsx',
  'src/pages/admin/UpdateReview.tsx',
  'src/pages/admin/UpdateUser.tsx',
  'src/pages/admin/UserDetails.tsx',
  'src/pages/admin/ViewOrder.tsx',
  'src/pages/admin/ViewProduct.tsx',
  'src/pages/user/Checkout/BillingAddressForm.tsx',
  'src/pages/user/Checkout/Checkout.tsx',
  'src/pages/user/Contact.tsx',
  'src/pages/user/EmailVerification.tsx',
  'src/pages/user/Login.tsx',
  'src/pages/user/MyAccount/MyAccount.tsx',
  'src/pages/user/MyAccount/UpdatePasswordForm.tsx',
  'src/pages/user/MyAccount/UpdateProfileForm.tsx',
  'src/pages/user/Register.tsx',
  'src/pages/user/ResetPassword.tsx'
];

for (const relPath of files) {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping: ${relPath} (does not exist)`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Replace useState({}) with useState<any>({})
  content = content.replace(/useState\(\{\}\)/g, 'useState<any>({})');

  // Also catch other patterns of state declaration for errors:
  // e.g. [errors, setErrors] = useState({ ... })
  content = content.replace(/(const\s+\[\s*(?:aboutErrors|contactErrors|errors)\s*,\s*set\w+Errors\s*\]\s*=\s*useState)\(/g, '$1<any>(');

  // Replace rows="N" with rows={N}
  content = content.replace(/rows="([0-9]+)"/g, 'rows={$1}');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${relPath}`);
  } else {
    console.log(`No change: ${relPath}`);
  }
}
