import React from "react";

import AddressForm from "./AddressForm";
import { useCheckout } from "./Checkout";
import StripePaymentForm from "./StripePaymentForm";
import { legendStyles, radioLabelStyles } from "./constants";

/* eslint-disable camelcase */

const PaymentForm = () => {
  const {
    data: { bill_address_method },
    updateCheckout,
  } = useCheckout();

  return (
    <div>
      <fieldset>
        <legend className={legendStyles}>Payment Method</legend>
        <StripePaymentForm />
      </fieldset>
      <fieldset>
        <legend className={legendStyles}>Billing Address</legend>
        <div>
          <label className={radioLabelStyles}>
            <input
              name="bill_address_method"
              type="radio"
              checked={bill_address_method === "same"}
              onChange={() => updateCheckout({ bill_address_method: "same" })}
            />
            <span className="ml-1">Same as shipping address</span>
          </label>
        </div>
        <div>
          <label className={radioLabelStyles}>
            <input
              name="bill_address_method"
              type="radio"
              checked={bill_address_method === "different"}
              onChange={() =>
                updateCheckout({ bill_address_method: "different" })
              }
            />
            <span className="ml-1">Use a different billing address</span>
          </label>
        </div>
        {bill_address_method === "different" && (
          <AddressForm stateKey="bill_address" />
        )}
      </fieldset>
    </div>
  );
};

export default PaymentForm;
