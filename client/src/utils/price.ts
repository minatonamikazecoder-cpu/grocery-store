/**
 * Calculates the final price after applying a percentage discount.
 * @param salePrice The original sale price.
 * @param discount The discount percentage (e.g., 10 for 10%).
 * @returns The final discounted price as a number.
 */
export const getDiscountedPrice = (salePrice: number, discount: number = 0): number => {
  if (!salePrice) return 0;
  return salePrice - (salePrice * discount) / 100;
};

/**
 * Calculates the final price after applying a percentage discount and returns it formatted to 2 decimal places.
 * @param salePrice The original sale price.
 * @param discount The discount percentage.
 * @returns The formatted string representation of the discounted price (e.g., "9.99").
 */
export const getFormattedDiscountedPrice = (salePrice: number, discount: number = 0): string => {
  return getDiscountedPrice(salePrice, discount).toFixed(2);
};
