// Unit tests for Offer calculations matching client/src/utils/offer.ts

function calculateOfferDiscount(subtotal, offer) {
  if (subtotal < offer.minimumOrder) return 0;
  const raw = subtotal * (offer.discount / 100);
  return Math.min(raw, offer.maxDiscount);
}

function isOfferApplicable(subtotal, offer) {
  return subtotal >= offer.minimumOrder;
}

describe("Offer Utility Calculations", () => {
    const mockOffer = {
        discount: 10,
        maxDiscount: 100,
        minimumOrder: 500
    };

    it("should return 0 discount if subtotal is below minimum order", () => {
        expect(calculateOfferDiscount(400, mockOffer)).toBe(0);
        expect(isOfferApplicable(400, mockOffer)).toBe(false);
    });

    it("should calculate correct discount above minimum order", () => {
        expect(calculateOfferDiscount(600, mockOffer)).toBe(60);
        expect(isOfferApplicable(600, mockOffer)).toBe(true);
    });

    it("should cap the discount at maxDiscount limit", () => {
        expect(calculateOfferDiscount(2000, mockOffer)).toBe(100);
        expect(isOfferApplicable(2000, mockOffer)).toBe(true);
    });
});
