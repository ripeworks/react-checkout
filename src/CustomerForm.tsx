import React from "react";

import { useCheckout } from "./Checkout";

/* eslint-disable camelcase */

type Props = {
  includeName?: boolean;
  includePhone?: boolean;
};

const CustomerForm = ({ includeName = false, includePhone = false }: Props) => {
  const {
    data: { first_name = "", last_name = "", email = "", phone = "" },
    styles,
    updateCheckout,
  } = useCheckout();

  return (
    <div>
      <fieldset>
        <legend className={styles.legend}>Customer Information</legend>
        <div className="flex flex-col">
          <input
            name="email"
            placeholder="Email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => updateCheckout({ email: e.target.value })}
            required
          />
          {includeName && (
            <>
              <input
                name="first_name"
                placeholder="First Name"
                className={styles.input}
                value={first_name}
                onChange={(e) => updateCheckout({ first_name: e.target.value })}
                required
              />
              <input
                name="last_name"
                placeholder="Last Name"
                className={styles.input}
                value={last_name}
                onChange={(e) => updateCheckout({ last_name: e.target.value })}
                required
              />
            </>
          )}
          {includePhone && (
            <input
              name="phone"
              placeholder="Phone Number"
              className={styles.input}
              value={phone}
              onChange={(e) => updateCheckout({ phone: e.target.value })}
              required
            />
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default CustomerForm;
