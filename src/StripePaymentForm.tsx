import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import React from "react";

import { inputStyles } from "./constants";

const StripePaymentForm = () => {
  return (
    <div>
      <CardNumberElement className={inputStyles} />
      <div className="flex">
        <CardExpiryElement className={inputStyles} />
        <div className="flex-none w-4" />
        <CardCvcElement className={inputStyles} />
      </div>
    </div>
  );
};

export default StripePaymentForm;
