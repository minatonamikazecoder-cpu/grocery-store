// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
      const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    ratings: "",
    priceRange: "",
    discount: "",
  });
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Fetch products once
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products/");
        setAllProducts(data);
        setFilteredProducts(data); // default view
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter logic (your old handleSubmit)
  const filterProducts = () => {
    let result = [...allProducts];

    // Search by name
    if (searchQuery) {
      result = result.filter((product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Ratings
    if (filters.ratings) {
      result = result.filter((p) => p.averageRating >= parseInt(filters.ratings));
    }

    // Price range
    if (filters.priceRange) {
      result = result.filter((p) => {
        const price = p.salePrice - (p.salePrice * p.discount) / 100;
        switch (filters.priceRange) {
          case "lt50":
            return price < 50;
          case "51to100":
            return price >= 51 && price <= 100;
          case "101to200":
            return price >= 101 && price <= 200;
          case "201to500":
            return price >= 201 && price <= 500;
          case "gt500":
            return price > 500;
          default:
            return true;
        }
      });
    }

    // Discount
    if (filters.discount) {
      result = result.filter((p) => {
        const discount = p.discount;
        switch (filters.discount) {
          case "lt5":
            return discount < 5;
          case "5to15":
            return discount >= 5 && discount <= 15;
          case "15to25":
            return discount >= 15 && discount <= 25;
          case "gt25":
            return discount > 25;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(result);
  };

  // Automatically filter when query or filters change
  useEffect(() => {
    filterProducts();
  }, [searchQuery, filters, allProducts]);


	const [token, setToken] = useState(localStorage.getItem("token") || null);
	
	const [user, setUser] = useState(() => {
		try {
			const userData = localStorage.getItem("user");
			return userData ? JSON.parse(userData) : null;
		} catch (error) {
			console.error("Error parsing user data from localStorage:", error);
			return null;
		}
	});
	// ✅ New: Refresh all states from localStorage
	const refresh = () => {
		const savedToken = localStorage.getItem("token");
		const savedUser = localStorage.getItem("user");

		setToken(savedToken || null);

		try {
			setUser(savedUser ? JSON.parse(savedUser) : null);
		} catch (error) {
			console.error("Error parsing user data during refresh:", error);
			setUser(null);
		}
	};
	// ✅ Fetch cart and wishlist counts
	const fetchInitialCounts = async (userId) => {
  try {
    // Fetch Cart
    const cartRes = await api.get(`/cart/${userId}`);
    if (cartRes?.data?.items?.length)
      updateCartCount(cartRes.data.items.length);

    // Fetch Wishlist
    const wishlistRes = await api.get(`/wishlist/${userId}`);
    if (wishlistRes?.data?.wishlist?.productIds?.length)
      updateWishlistCount(
        wishlistRes.data?.wishlist?.productIds?.length || 0
      );

  } catch (error) {
      updateCartCount(0);
      updateWishlistCount(0);
  }
};

	useEffect(() => {
		if (user?._id) {
			fetchInitialCounts(user._id);
		}
	}, [user]);
	// ✅ Optional: Automatically refresh on mount
	useEffect(() => {
		refresh();
	}, []);
	// ✅ New states for cart and wishlist counts
	const [cartCount, setCartCount] = useState(0);
	const [wishlistCount, setWishlistCount] = useState(0);

	const login = (newToken, userData) => {
		setToken(newToken);
		setUser(userData);
		localStorage.setItem("token", newToken);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	const logout = () => {
		setToken(null);
		setUser(null);
		setCartCount(0); // Reset counts
		setWishlistCount(0);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	};

	const setUserData = (updatedUser) => {
		setUser(updatedUser);
		localStorage.setItem("user", JSON.stringify(updatedUser));
	};

	// ✅ Methods to update counts
	const updateCartCount = (count) => setCartCount(count);
	const updateWishlistCount = (count) => setWishlistCount(count);

	return (
		<AuthContext.Provider
			value={{
				token,
				user,
				login,
				logout,
				isLoggedIn: !!token,
				setUserData,
				cartCount,
				wishlistCount,
				updateCartCount,
				updateWishlistCount,
				searchQuery,
				setSearchQuery,
                    filters,
        setFilters,
        filteredProducts,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
