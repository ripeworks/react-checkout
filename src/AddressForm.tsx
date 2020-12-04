import React from "react";

import { useCheckout } from "./Checkout";
import { US_STATES, inputStyles, selectStyles } from "./constants";

/* eslint-disable camelcase */

type Props = {
  includeName?: boolean;
  stateKey: "ship_address" | "bill_address";
};

const AddressForm = ({ includeName = false, stateKey }: Props) => {
  const { data, updateCheckout } = useCheckout();
  const {
    first_name = "",
    last_name = "",
    address = "",
    address2 = "",
    city = "",
    state = "",
    zip = "",
    country = "",
  } = data[stateKey];

  const onChange = (field: string) => (e) => {
    updateCheckout({
      [stateKey]: {
        ...data[stateKey],
        [field]: e.target.value,
      },
    });
  };

  return (
    <div>
      {includeName && (
        <div>
          <input
            name="first_name"
            placeholder="First Name"
            className={inputStyles}
            value={first_name}
            onChange={onChange("first_name")}
            required
          />
          <input
            name="last_name"
            placeholder="First Name"
            className={inputStyles}
            value={last_name}
            onChange={onChange("first_name")}
            required
          />
        </div>
      )}
      <div>
        <input
          name="address"
          placeholder="Address"
          className={inputStyles}
          value={address}
          onChange={onChange("address")}
          required
        />
        <input
          name="address2"
          placeholder="Apartment, Suite, etc (optional)"
          className={inputStyles}
          value={address2}
          onChange={onChange("address2")}
          required
        />
        <input
          name="city"
          placeholder="City"
          className={inputStyles}
          value={city}
          onChange={onChange("city")}
          required
        />
      </div>
      <div className="flex">
        <select
          name="country"
          placeholder="Country"
          className={selectStyles}
          value={country}
          onChange={onChange("country")}
          required
        >
          <option value="US">US</option>
        </select>
        <div className="flex-none w-4" />
        <select
          name="state"
          placeholder="State"
          className={selectStyles}
          value={state}
          onChange={onChange("state")}
          required
        >
          {Object.keys(US_STATES).map((stateAbbrev) => (
            <option key={stateAbbrev}>{stateAbbrev}</option>
          ))}
        </select>
        <div className="flex-none w-4" />
        <input
          name="zip"
          placeholder="ZIP code"
          className={inputStyles}
          value={zip}
          onChange={onChange("zip")}
          required
        />
      </div>
    </div>
  );
};

export default AddressForm;
