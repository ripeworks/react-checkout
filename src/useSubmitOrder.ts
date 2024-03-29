import { useCallback, useState } from "react";
import {
  CardNumberElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { OrderRequestPayload, useCheckout } from "./Checkout";
import { useTotal } from "./useTotal";

const requiredFields = [
  "email",
  "first_name",
  "last_name",
  "phone",
  "ship_method",
] as const;

export const useSubmitOrder = (
  orderHandler: (order: OrderRequestPayload) => Promise<void>,
  options?: { customer?: string }
) => {
  const { data, discount_price, ship_price, subtotal, tax } = useCheckout();
  const total = useTotal();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<Error | null>(null);

  const submitOrder = useCallback(async () => {
    if (!stripe) return;
    setSubmitting(true);
    setOrderError(null);
    try {
      if (!requiredFields.every((field) => data[field])) {
        throw new Error(
          "Missing required fields. Please complete all fields and try again."
        );
      }
      const address = data.bill_address || data.ship_address;
      if (!address) {
        throw new Error(
          "Missing address. Please complete all fields and try again."
        );
      }
      const cardElement = elements?.getElement(CardNumberElement);
      let paymentToken = "";

      const orderPayload = {
        ...data,
        bill_address:
          data.bill_address_method === "same"
            ? data.ship_address
            : data.bill_address,
        customer: options?.customer,
        discount_price: discount_price.toFixed(2),
        ship_price: ship_price.toFixed(2),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      };

      const intentResponse = await fetch("/api/intent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...orderPayload,
          hasCardElement: !!cardElement,
        }),
      });

      const { secret } = await intentResponse.json();

      if (cardElement) {
        const { paymentIntent, error } = await stripe.confirmCardPayment(
          secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${address.first_name || data.first_name} ${
                  address.last_name || data.last_name
                }`,
                address: {
                  line1: address.address,
                  line2: address.address2,
                  city: address.city,
                  state: address.state,
                  postal_code: address.zip,
                  country: address.country,
                },
                phone: data.phone ?? "",
              },
            },
          }
        );
        if (error?.message) {
          throw new Error(error.message);
        }
        paymentToken = paymentIntent?.id ?? "";
      } else {
        const { paymentIntent, error } = await stripe.confirmCardPayment(
          secret
        );
        if (error?.message) {
          throw new Error(error.message);
        }
        paymentToken = paymentIntent?.id ?? "";
      }

      await orderHandler({
        ...orderPayload,
        paymentToken,
      });
    } catch (err) {
      console.log(err); //eslint-disable-line no-console
      setOrderError(err as Error);
    }
    setSubmitting(false);
  }, [
    data,
    discount_price,
    ship_price,
    subtotal,
    tax,
    total,
    stripe,
    elements,
  ]);

  return { submitOrder, submitting, error: orderError };
};

export default useSubmitOrder;
