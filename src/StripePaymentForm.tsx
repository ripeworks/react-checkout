import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import React from "react";

type Props = {
  inputStyles?: string;
};

const StripePaymentForm = ({ inputStyles = "" }: Props) => {
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
