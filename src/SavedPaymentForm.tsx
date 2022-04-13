import React from "react";

import AddressForm from "./AddressForm";
import { useCheckout } from "./Checkout";
import StripePaymentForm from "./StripePaymentForm";

/* eslint-disable camelcase */

type Props = {
  paymentMethods?: {
    id: string;
    label: string;
  }[];
};

const SavedPaymentForm = ({ paymentMethods }: Props) => {
  const {
    data: { bill_address_method, payment_method, prefer_save_payment },
    styles,
    updateCheckout,
  } = useCheckout();

  return (
    <div>
      <fieldset>
        <legend className={styles.legend}>Payment Method</legend>
        {!!paymentMethods && (
          <>
            {paymentMethods.map((paymentMethod) => (
              <label key={paymentMethod.id} className={styles.radio}>
                <input
                  name="payment_method"
                  type="radio"
                  checked={payment_method === paymentMethod.id}
                  onChange={() =>
                    updateCheckout({ payment_method: paymentMethod.id })
                  }
                />
                <span className="ml-1">
                  Stored payment ({paymentMethod.label})
                </span>
              </label>
            ))}
            <label className={styles.radio}>
              <input
                name="payment_method"
                type="radio"
                checked={payment_method === ""}
                onChange={() => updateCheckout({ payment_method: "" })}
              />
              <span className="ml-1">Enter new payment</span>
            </label>
          </>
        )}
        {!payment_method && (
          <>
            <StripePaymentForm inputStyles={styles.input} />
            {!!paymentMethods && (
              <div className="pt-4">
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="prefer_save_payment"
                    checked={prefer_save_payment === true}
                    onChange={(e) =>
                      updateCheckout({ prefer_save_payment: e.target.checked })
                    }
                  />
                  <span className="ml-1">Save payment for later</span>
                </label>
              </div>
            )}
          </>
        )}
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

export default SavedPaymentForm;
