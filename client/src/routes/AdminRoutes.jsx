import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
const Dashboard = React.lazy(() => import("../pages/admin/Dashboard"));
const AddBanner = React.lazy(() => import("../pages/admin/AddBanner"));
const AddToCart = React.lazy(() => import("../pages/admin/AddToCart"));
const AddCategory = React.lazy(() => import("../pages/admin/AddCategory"));
const AddOffer = React.lazy(() => import("../pages/admin/AddOffer"));
const AddOrder = React.lazy(() => import("../pages/admin/AddOrder"));
const AddProduct = React.lazy(() => import("../pages/admin/AddProduct"));
const AddReview = React.lazy(() => import("../pages/admin/AddReview"));
const Cart = React.lazy(() => import("../pages/admin/Cart"));
const Users = React.lazy(() => import("../pages/admin/Users"));
const UpdateUser = React.lazy(() => import("../pages/admin/UpdateUser"));
const AddUser = React.lazy(() => import("../pages/admin/AddUser"));
const Products = React.lazy(() => import("../pages/admin/Products"));
const ViewProduct = React.lazy(() => import("../pages/admin/ViewProduct"));
const MyProfile = React.lazy(() => import("../pages/admin/MyProfile"));
const Reviews = React.lazy(() => import("../pages/admin/Reviews"));
const Responses = React.lazy(() => import("../pages/admin/Responses"));
const SiteSettings = React.lazy(() => import("../pages/admin/SiteSettings"));
const Offers = React.lazy(() => import("../pages/admin/Offers"));
const UpdateCategory = React.lazy(() => import("../pages/admin/UpdateCategory"));
const UpdateOffer = React.lazy(() => import("../pages/admin/UpdateOffer"));
const UpdateReview = React.lazy(() => import("../pages/admin/UpdateReview"));
const ViewOrder = React.lazy(() => import("../pages/admin/ViewOrder"));
const Orders = React.lazy(() => import("../pages/admin/Orders"));
const UpdateCart = React.lazy(() => import("../pages/admin/UpdateCart"));
const UpdateBanner = React.lazy(() => import("../pages/admin/UpdateBanner"));
const Banners = React.lazy(() => import("../pages/admin/Banners"));
const Categories = React.lazy(() => import("../pages/admin/Categories"));
const UpdateProduct = React.lazy(() => import("../pages/admin/UpdateProduct"));
const UserDetails = React.lazy(() => import("../pages/admin/UserDetails"));
const UpdateOrder = React.lazy(() => import("../pages/admin/UpdateOrder"));
const EmailVerification = React.lazy(() => import("../pages/admin/EmailVerification"));

const AdminRoutes = () => {
  return (
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
  );
};

export default AdminRoutes;
