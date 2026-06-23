import { Product } from "../types";
import { getDiscountedPrice } from "./price";

export interface FilterState {
  ratings: string;
  priceRange: string;
  discount: string;
}

/**
 * Filter a list of products based on rating, price range, discount, and optionally a search query.
 */
export const filterProducts = (
  products: Product[],
  filters: FilterState,
  searchQuery?: string
): Product[] => {
  return products.filter((product) => {
    // Filter by search query if provided
    if (searchQuery) {
      const name = (product.productName || "").toLowerCase();
      const desc = (product.description || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      if (!name.includes(query) && !desc.includes(query)) return false;
    }

    // 1. Filter by ratings
    if (filters.ratings) {
      const avgRating = product.averageRating || 0;
      if (avgRating < parseFloat(filters.ratings)) return false;
    }

    // Calculate discounted price
    const salePrice = product.salePrice || 0;
    const discount = product.discount || 0;
    const discountedPrice = getDiscountedPrice(salePrice, discount);

    // 2. Filter by priceRange
    if (filters.priceRange) {
      if (filters.priceRange === "lt50" && discountedPrice >= 50) return false;
      if (filters.priceRange === "51to100" && (discountedPrice < 51 || discountedPrice > 100)) return false;
      if (filters.priceRange === "101to200" && (discountedPrice < 101 || discountedPrice > 200)) return false;
      if (filters.priceRange === "201to500" && (discountedPrice < 201 || discountedPrice > 500)) return false;
      if (filters.priceRange === "gt500" && discountedPrice <= 500) return false;
    }

    // 3. Filter by discount
    if (filters.discount) {
      if (filters.discount === "lt5" && discount >= 5) return false;
      if (filters.discount === "5to15" && (discount < 5 || discount > 15)) return false;
      if (filters.discount === "15to25" && (discount < 15 || discount > 25)) return false;
      if (filters.discount === "gt25" && discount <= 25) return false;
    }

    return true;
  });
};
