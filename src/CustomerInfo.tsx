import React, { useMemo } from "react";

import Address from "./Address";
import { useCheckout } from "./Checkout";

/* eslint-disable camelcase */

const CustomerInfo = () => {
  const {
    data: {
      email,
      ship_address,
      bill_address,
      bill_address_method,
      ship_method,
    },
    shippingMethods,
  } = useCheckout();

  const shipMethod = useMemo(
    () => shippingMethods.find((method) => method.id === ship_method),
    [shippingMethods, ship_method]
  );

  return (
    <div>
      <fieldset>
        <legend>Customer Information</legend>
        <div className="checkout-panel checkout-panel-cols">
          <div>
            <h4>Contact Information</h4>
            {email}
            <h4>Shipping Address</h4>
            <Address address={ship_address} />

            {!!shipMethod && (
              <>
                <h4>Shipping Method</h4>
                <p>{shipMethod.name}</p>
              </>
            )}
          </div>
          <div>
            <h4>Billing Address</h4>
            <Address
              address={
                bill_address_method === "same" ? ship_address : bill_address
              }
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default CustomerInfo;
