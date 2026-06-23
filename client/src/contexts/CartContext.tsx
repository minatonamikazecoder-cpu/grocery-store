import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cartCount: number;
  wishlistCount: number;
  updateCartCount: (count: number) => void;
  updateWishlistCount: (count: number) => void;
  fetchInitialCounts: (userId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateCartCount = (count: number) => setCartCount(count);
  const updateWishlistCount = (count: number) => setWishlistCount(count);

  const fetchInitialCounts = async (userId: string) => {
    try {
      const cartRes = await api.get(`/cart/${userId}`);
      if (cartRes?.data?.items?.length) {
        updateCartCount(cartRes.data.items.length);
      } else {
        updateCartCount(0);
      }

      const wishlistRes = await api.get(`/wishlist/${userId}`);
      if (wishlistRes?.data?.wishlist?.productIds?.length) {
        updateWishlistCount(wishlistRes.data.wishlist.productIds.length);
      } else {
        updateWishlistCount(0);
      }
    } catch {
      updateCartCount(0);
      updateWishlistCount(0);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInitialCounts(user.id);
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        wishlistCount,
        updateCartCount,
        updateWishlistCount,
        fetchInitialCounts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
