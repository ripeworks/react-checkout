import React, { useState } from "react";

import { useCheckout } from "./Checkout";
import { money } from "./money";

/* eslint-disable camelcase */

type Props = {
  ItemComponent: React.ElementType<any>;
};

const CheckoutSidebar = ({ ItemComponent }: Props) => {
  const {
    data: { discount_code, items, ship_method },
    complete,
    applyDiscount,
    discount_price,
    ship_price,
    styles,
    subtotal,
    tax,
  } = useCheckout();

  const [discount, setDiscount] = useState("");

  if (items.length < 1) {
    return (
      <details className="appearance-none" open>
        <summary />
      </details>
    );
  }

  return (
    <details className="my-8" open>
      <summary className="text-blue-900 appearance-none mb-6">
        Order Summary
      </summary>
      <div className="flex flex-col">
        {items.map((item) => (
          <ItemComponent key={item.id} item={item} />
        ))}
      </div>
      {!discount_code && !complete && (
        <>
          <div className="flex items-center justify-center">
            <input
              type="text"
              placeholder="Discount code"
              className={styles.input}
              onChange={(e) => setDiscount(e.target.value)}
              value={discount}
            />
            <button
              type="button"
              onClick={() => {
                try {
                  applyDiscount(discount);
                } catch (err) {
                  setDiscount("");
                }
              }}
            >
              Apply
            </button>
          </div>
        </>
      )}
      <div className="flex text-sm text-gray-600 mt-3">
        <span>Subtotal:</span>
        <span className="ml-auto">{money(subtotal)}</span>
      </div>
      {!!tax && (
        <div className="flex text-sm text-gray-600 mt-3">
          <span>Tax:</span>
          <span className="ml-auto">{money(tax)}</span>
        </div>
      )}
      {!!ship_method && (
        <div className="flex text-sm text-gray-600 mt-3">
          <span>Shipping:</span>
          <span className="ml-auto">{money(ship_price)}</span>
        </div>
      )}
      {!!discount_code && (
        <div className="flex text-sm text-gray-600 mt-3">
          <span>
            Discount <em>({discount_code})</em>:
          </span>
          <span className="ml-auto">{money(discount_price)}</span>
        </div>
      )}
    </details>
  );
};

export default CheckoutSidebar;
