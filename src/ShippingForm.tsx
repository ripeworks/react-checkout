import React, { useEffect, useState } from "react";

import { useCheckout } from "./Checkout";
import type { Address } from "./Checkout";
import { money } from "./money";

/* eslint-disable camelcase */

const addressToString = ({
  address,
  address2 = "",
  city,
  state,
  zip,
  country,
}: Address) => {
  return `${address}${
    address2 ? " " + address2 : ""
  }, ${city} ${state}, ${zip} ${country}`;
};

type Props = {
  hidePrice?: boolean;
  steps?: boolean;
};

type ShippingMethod = {
  id: string;
  name: string;
  price: number;
};

const ShippingForm = ({ hidePrice = false, steps = false }: Props) => {
  const {
    data: { email, ship_address, ship_method },
    styles,
    shippingMethods,
    updateCheckout,
  } = useCheckout();

  const [shippingMethodsWithPrice, setShippingMethods] = useState<
    ShippingMethod[]
  >([]);

  useEffect(() => {
    Promise.all(
      shippingMethods.map(async (shipMethod) => {
        const price =
          typeof shipMethod.price === "function"
            ? await shipMethod.price()
            : shipMethod.price;
        return { ...shipMethod, price };
      })
    ).then((data) => {
      setShippingMethods(data);

      if (data.length === 1 && !ship_method) {
        updateCheckout({ ship_method: data[0].id });
      }
    });
  }, [shippingMethods]);

  return (
    <div>
      {!!steps && (
        <div className="checkout-panel">
          <div className="checkout-panel--option">
            <span className="checkout-panel--label">Contact</span>
            <span>{email}</span>
            <a onClick={() => updateCheckout({ step: 1 })}>Change</a>
          </div>
          <div className="checkout-panel--option">
            <span className="checkout-panel--label">Ship to</span>
            <span>{ship_address ? addressToString(ship_address) : ""}</span>
            <a onClick={() => updateCheckout({ step: 1 })}>Change</a>
          </div>
        </div>
      )}
      <fieldset>
        <legend className={styles.legend}>Shipping Method</legend>
        <div className="checkout-panel">
          {shippingMethodsWithPrice.map((shipMethod) => (
            <div className="checkout-panel--option" key={shipMethod.id}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  value={shipMethod.id}
                  checked={ship_method === shipMethod.id}
                  onChange={(e) =>
                    updateCheckout({ ship_method: e.target.value })
                  }
                />
                <span className="mx-1">{shipMethod.name}</span>
                {!hidePrice && <span>{money(shipMethod.price)}</span>}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default ShippingForm;
