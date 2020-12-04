import { useCheckout } from "./Checkout";

export const useTotal = () => {
  const { subtotal, ship_price, discount_price, tax } = useCheckout();
  return calculateTotal({ subtotal, discount_price, ship_price, tax });
};

function calculateTotal({
  subtotal,
  ship_price,
  discount_price,
  tax,
}: {
  subtotal: number;
  ship_price: number;
  discount_price: number;
  tax: number;
}) {
  return subtotal - discount_price + ship_price + tax;
}
