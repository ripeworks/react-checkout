import React, { useState } from "react";

import { useCheckout } from "./Checkout";
import { money } from "./money";

/* eslint-disable camelcase */

type Props = {
  ItemComponent: React.ElementType<any>;
  lineItemStyles?: string;
  lineItemCostStyles?: string;
};

const CheckoutSidebar = ({
  ItemComponent,
  lineItemStyles = "text-sm text-neutral-600 mt-3",
  lineItemCostStyles = "",
}: Props) => {
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
      <summary className={styles.summary}>Order Summary</summary>
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
              className="ml-4"
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
      <div className={`flex items-center justify-between ${lineItemStyles}`}>
        <span>Subtotal:</span>
        <span className={lineItemCostStyles}>{money(subtotal)}</span>
      </div>
      {!!tax && (
        <div className={`flex items-center justify-between ${lineItemStyles}`}>
          <span>Tax:</span>
          <span className={lineItemCostStyles}>{money(tax)}</span>
        </div>
      )}
      {!!ship_method && (
        <div className={`flex items-center justify-between ${lineItemStyles}`}>
          <span>Shipping:</span>
          <span className={lineItemCostStyles}>{money(ship_price)}</span>
        </div>
      )}
      {!!discount_code && (
        <div className={`flex items-center justify-between ${lineItemStyles}`}>
          <span>
            Discount <em>({discount_code})</em>:
          </span>
          <span className={lineItemCostStyles}>{money(discount_price)}</span>
        </div>
      )}
    </details>
  );
};

export default CheckoutSidebar;
