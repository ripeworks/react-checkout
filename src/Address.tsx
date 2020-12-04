import React from "react";

import type { Address as AddressType } from "./Checkout";

type Props = {
  address: AddressType;
};

const Address = ({ address }: Props) => {
  return (
    <p>
      {(address.first_name || address.last_name) && (
        <>
          {[address.first_name, address.last_name].filter(Boolean).join(" ")}
          <br />
        </>
      )}
      {address.address}
      <br />
      {address.address2 ? (
        <span>
          {address.address2}
          <br />
        </span>
      ) : (
        ""
      )}
      {address.city}, {address.state} {address.zip}
    </p>
  );
};

export default Address;
