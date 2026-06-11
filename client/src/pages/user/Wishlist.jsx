import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import WishlistTable from "../../components/user/WishlistTable";
import { useAuth } from "../../contexts/AuthContext";

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect to login if user not found
    }
  }, [user, navigate]);

  return (
    <div className="container cart-table">
      <p className="my-5">
        <Link to="/" className="text-decoration-none dim link">Home /</Link> Wishlist
      </p>
      {user?._id ? <WishlistTable userId={user._id} /> : <p>Loading...</p>}
    </div>
  );
};

export default Wishlist;
