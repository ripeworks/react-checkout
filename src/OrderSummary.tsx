import React from "react";

import Address from "./Address";
import type { Address as AddressType, Item } from "./Checkout";
import { money } from "./money";

type Props = {
  email: string;
  billAddress: AddressType;
  shipAddress: AddressType;
  shipMethod: string;
  paymentMethod: string;
  items: Item[];
  ItemComponent: React.ElementType<any>;
  total: string;
  headingStyles?: string;
};

const dataStyles = "text-gray-600";

const OrderSummary = ({
  email,
  billAddress,
  shipAddress,
  shipMethod,
  paymentMethod,
  items,
  ItemComponent,
  headingStyles = "text-blue-900 my-4",
  total,
}: Props) => {
  return (
    <div className="flex pt-8">
      <div className="flex-1">
        <div>
          <p className={headingStyles}>Contact information</p>
          <div className={dataStyles}>{email}</div>
          <p className={headingStyles}>Shipping address</p>
          <div className={dataStyles}>
            <Address address={shipAddress} />
          </div>
          <p className={headingStyles}>Shipping method</p>
          <div className={dataStyles}>{shipMethod}</div>
        </div>
        <div>
          <p className={headingStyles}>Payment method</p>
          <div className={dataStyles}>{paymentMethod}</div>
          <p className={headingStyles}>Billing address</p>
          <div className={dataStyles}>
            <Address address={billAddress} />
          </div>
        </div>
      </div>
      <div className="flex-1">
        {items.map((item) => (
          <ItemComponent item={item} />
        ))}
        <div className="flex text-xl text-gray-600 mt-4 justify-end">
          <span>Order total:</span>
          <span className="ml-1">{money(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
