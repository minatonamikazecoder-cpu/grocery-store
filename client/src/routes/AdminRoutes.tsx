import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const AddBanner = lazy(() => import("../pages/admin/AddBanner"));
const AddToCart = lazy(() => import("../pages/admin/AddToCart"));
const AddCategory = lazy(() => import("../pages/admin/AddCategory"));
const AddOffer = lazy(() => import("../pages/admin/AddOffer"));
const AddOrder = lazy(() => import("../pages/admin/AddOrder"));
const AddReview = lazy(() => import("../pages/admin/AddReview"));
const Cart = lazy(() => import("../pages/admin/Cart"));
const Users = lazy(() => import("../pages/admin/Users"));
const UpdateUser = lazy(() => import("../pages/admin/UpdateUser"));
const AddUser = lazy(() => import("../pages/admin/AddUser"));
const Products = lazy(() => import("../pages/admin/Products"));
const ViewProduct = lazy(() => import("../pages/admin/ViewProduct"));
const MyProfile = lazy(() => import("../pages/admin/MyProfile"));
const Reviews = lazy(() => import("../pages/admin/Reviews"));
const Responses = lazy(() => import("../pages/admin/Responses"));
const SiteSettings = lazy(() => import("../pages/admin/SiteSettings"));
const Offers = lazy(() => import("../pages/admin/Offers"));
const UpdateCategory = lazy(() => import("../pages/admin/UpdateCategory"));
const UpdateOffer = lazy(() => import("../pages/admin/UpdateOffer"));
const UpdateReview = lazy(() => import("../pages/admin/UpdateReview"));
const ViewOrder = lazy(() => import("../pages/admin/ViewOrder"));
const Orders = lazy(() => import("../pages/admin/Orders"));
const UpdateCart = lazy(() => import("../pages/admin/UpdateCart"));
const UpdateBanner = lazy(() => import("../pages/admin/UpdateBanner"));
const Banners = lazy(() => import("../pages/admin/Banners"));
const Categories = lazy(() => import("../pages/admin/Categories"));
const UpdateProduct = lazy(() => import("../pages/admin/UpdateProduct"));
const UserDetails = lazy(() => import("../pages/admin/UserDetails"));
const UpdateOrder = lazy(() => import("../pages/admin/UpdateOrder"));
const EmailVerification = lazy(() => import("../pages/admin/EmailVerification"));

const AdminLoader = () => (
  <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "200px" }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const AdminRoutes = () => {
  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="banners" element={<Banners />} />
          <Route path="add-banner" element={<AddBanner />} />
          <Route path="update-banner/:id" element={<UpdateBanner />} />
          
          <Route path="users" element={<Users />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="update-user/:id" element={<UpdateUser />} />
          <Route path="user-details/:id" element={<UserDetails />} />

          <Route path="cart/:userId" element={<Cart />} />
          <Route path="add-to-cart/:userId" element={<AddToCart />} />
          <Route path=":userId/update-cart/:productId" element={<UpdateCart />} />

          <Route path="reviews" element={<Reviews />} />
          <Route path="add-review" element={<AddReview />} />
          <Route path="update-review/:id" element={<UpdateReview />} />

          <Route path="products" element={<Products />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="update-product/:id" element={<UpdateProduct />} />
          <Route path="view-product/:id" element={<ViewProduct />} />

          <Route path="categories" element={<Categories />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="update-category/:id" element={<UpdateCategory />} />

          <Route path="offers" element={<Offers />} />
          <Route path="add-offer" element={<AddOffer />} />
          <Route path="update-offer/:id" element={<UpdateOffer />} />

          <Route path="responses" element={<Responses />} />

          <Route path="site-settings" element={<SiteSettings />} />

          <Route path="my-profile" element={<MyProfile />} />
          <Route path="verify-email" element={<EmailVerification />} />

          <Route path="orders" element={<Orders />} />
          <Route path="add-order" element={<AddOrder />} />
          <Route path="update-order/:orderId" element={<UpdateOrder />} />
          <Route path="view-order/:orderId" element={<ViewOrder />} />

        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
