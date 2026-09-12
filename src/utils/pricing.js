export function computeBookingPricing(car, days, coupon = null, extras = {}) {
  const pricePerDay = Number(car?.pricePerDay) || 0;
  const rentalDays = Math.max(1, Number(days) || 1);

  const baseRental = pricePerDay * rentalDays;
  const insurance = Math.round(baseRental * 0.1);
  const taxes = Math.round((baseRental + insurance) * 0.08);
  const fuelCharges = Number(extras.fuelCharges) || 0;
  const damageCharges = Number(extras.damageCharges) || 0;
  const lateCharges = Number(extras.lateCharges) || 0;
  const otherCharges = Number(extras.otherCharges) || 0;
  const additionalCharges = Math.round(fuelCharges + damageCharges + lateCharges + otherCharges);

  let discount = 0;
  if (coupon && isCouponValid(coupon, baseRental)) {
    const rawDiscount = (baseRental * Number(coupon.discountPercent || 0)) / 100;
    const maxDisc = Number(coupon.maxDiscount) || Infinity;
    discount = Math.round(Math.min(rawDiscount, maxDisc));
  }

  const finalAmount = baseRental + insurance + taxes + additionalCharges - discount;

  return {
    pricePerDay,
    rentalDays,
    baseRental: Math.round(baseRental),
    insurance,
    taxes,
    additionalCharges,
    fuelCharges: Math.round(fuelCharges),
    damageCharges: Math.round(damageCharges),
    lateCharges: Math.round(lateCharges),
    otherCharges: Math.round(otherCharges),
    discount,
    finalAmount: Math.max(0, Math.round(finalAmount)),
    couponCode: discount > 0 ? coupon.code : null,
  };
}

export function isCouponValid(coupon, baseRental) {
  if (!coupon) return false;
  const now = Date.now();
  const start = coupon.startDate ? new Date(coupon.startDate).getTime() : 0;
  const expiry = coupon.expiryDate ? new Date(coupon.expiryDate).getTime() : Infinity;
  if (coupon.status !== 'active' && !coupon.active) return false;
  if (now < start || now > expiry) return false;
  if (Number(coupon.minBookingAmount) > 0 && baseRental < Number(coupon.minBookingAmount)) return false;
  const used = Number(coupon.usedCount) || 0;
  if (Number(coupon.usageLimit) > 0 && used >= Number(coupon.usageLimit)) return false;
  return true;
}