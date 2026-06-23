import { Offer } from "../types";

export function calculateOfferDiscount(subtotal: number, offer: Offer): number {
  if (subtotal < offer.minimumOrder) return 0;
  const raw = subtotal * (offer.discount / 100);
  return Math.min(raw, offer.maxDiscount);
}

export function isOfferApplicable(subtotal: number, offer: Offer): boolean {
  return subtotal >= offer.minimumOrder;
}
