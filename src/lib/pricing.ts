export const GST_RATE = 0.05;
export const DELIVERY_FEE_CENTS = 500;

export function calculatePricing(subtotalCents:number, delivery:boolean){
  const deliveryCents=delivery?DELIVERY_FEE_CENTS:0;
  const taxableCents=subtotalCents+deliveryCents;
  const taxCents=Math.round(taxableCents*GST_RATE);
  return {subtotalCents,deliveryCents,taxCents,totalCents:taxableCents+taxCents};
}
