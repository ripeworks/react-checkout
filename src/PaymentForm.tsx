import React from "react";

import AddressForm from "./AddressForm";
import { useCheckout } from "./Checkout";
import StripePaymentForm from "./StripePaymentForm";

/* eslint-disable camelcase */

const PaymentForm = () => {
  const {
    data: { bill_address_method },
    styles,
    updateCheckout,
  } = useCheckout();

  return (
    <div>
      <fieldset>
        <legend className={styles.legend}>Payment Method</legend>
        <StripePaymentForm inputStyles={styles.input} />
      </fieldset>
      <fieldset>
        <legend className={styles.legend}>Billing Address</legend>
        <div>
          <label className={styles.radio}>
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
          <label className={styles.radio}>
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
