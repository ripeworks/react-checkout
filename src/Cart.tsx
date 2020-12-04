import React from "react";

import { useCheckout } from "./Checkout";
import { money } from "./money";

type Props = {
  ItemComponent: React.ElementType<any>;
  subtotal?: boolean;
};

const Cart = ({ ItemComponent, subtotal: showSubtotal = false }: Props) => {
  const {
    data: { items },
    subtotal,
    clearCart,
    updateCart,
  } = useCheckout();
  const isEmpty = items.length === 0;

  return (
    <div>
      {isEmpty && (
        <div>
          <h2>Empty</h2>
        </div>
      )}
      {items.map((item) => (
        <ItemComponent key={item.id} item={item} updateCart={updateCart} />
      ))}
      {!isEmpty && showSubtotal && (
        <div>
          <span>Subtotal:</span>
          <span>{money(subtotal)}</span>
        </div>
      )}
    </div>
  );
};

export default Cart;
