/* global Intl */
import {
  Elements,
  CardNumberElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import storage from "local-storage-fallback";
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";

/* eslint-disable camelcase */

export type Item = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type Address = {
  first_name?: string;
  last_name?: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type Discount = {
  id: string;
  amount: (total: number) => Promise<number>;
};

type ShippingMethod = {
  id: string;
  name: string;
  price: number | (() => Promise<number>);
};

type CheckoutStateType = {
  bill_address?: Address;
  bill_address_method: "same" | "different";
  discount_code?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  items: Item[];
  ship_address?: Address;
  ship_method: string;
  step: number;
  tax_rate: number;
};

type CheckoutContextType = {
  complete: boolean;
  data: CheckoutStateType;
  discount_price: number;
  ship_price: number;
  subtotal: number;
  tax: number;
  shippingMethods: ShippingMethod[];
  applyDiscount?: (discount: string) => Error | void;
  clearCart?: () => void;
  updateCheckout?: (nextState: Partial<CheckoutStateType>) => void;
  updateCart?: (item: Item) => void;
};

export type OrderRequestPayload = CheckoutStateType & {
  discount_price: string;
  ship_price: string;
  subtotal: string;
  total: string;
  tax: string;
  paymentToken: string;
};

const initialState: CheckoutStateType = {
  bill_address: {
    first_name: "",
    last_name: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  },
  bill_address_method: "same",
  email: "",
  discount_code: null,
  items: [],
  ship_address: {
    first_name: "",
    last_name: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  },
  ship_method: "",
  step: 1,
  tax_rate: 0,
};

const initialContext: CheckoutContextType = {
  complete: false,
  data: initialState,
  shippingMethods: [],
  discount_price: 0,
  ship_price: 0,
  subtotal: 0,
  tax: 0,
};

const CheckoutContext = createContext<CheckoutContextType>(initialContext);

const requiredFields = [
  "email",
  "first_name",
  "last_name",
  "phone",
  "ship_method",
];

let stripePromise;

type Props = {
  children: React.ReactNode;
  discounts?: Discount[];
  shippingMethods: ShippingMethod[];
  storageKey?: string;
  stripeAccount?: string;
};

export const CheckoutProvider = ({
  children,
  discounts = [],
  shippingMethods = [],
  storageKey = "checkoutState",
  stripeAccount = undefined,
}: Props) => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY, {
      stripeAccount,
    });
  }

  const [checkoutState, setCheckoutState] = useState(initialState);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    try {
      const hydratedState = JSON.parse(storage.getItem(storageKey));
      setCheckoutState(hydratedState);
    } catch (err) {
      console.error("Failed to load checkout state", err); // eslint-disable-line no-console
    }
  }, []);

  const persistCheckout = useCallback(
    (value) => {
      storage.setItem(storageKey, JSON.stringify(value));
    },
    [storageKey]
  );

  useEffect(() => {
    persistCheckout(checkoutState);
  }, [checkoutState]);

  const clearCart = useCallback(() => {
    setCheckoutState(initialState);
  }, []);

  const updateCart = useCallback((item: Item) => {
    setCheckoutState((prevState) => {
      const index = prevState.items.findIndex(
        (cartItem) => cartItem.id === item.id
      );
      const nextCart =
        index > -1
          ? item.quantity < 1
            ? [
                ...prevState.items.slice(0, index),
                ...prevState.items.slice(index + 1),
              ]
            : [
                ...prevState.items.slice(0, index),
                item,
                ...prevState.items.slice(index + 1),
              ]
          : [...prevState.items, item];

      return {
        ...prevState,
        items: nextCart,
      };
    });
  }, []);

  const applyDiscount = useCallback((discountCode) => {
    const discount = discounts.find((d) => d.id === discountCode);
    if (!discount) {
      throw new Error(`Invalid code '${discountCode}'`);
    }

    setCheckoutState((prevState) => ({
      ...prevState,
      discount_code: discountCode,
    }));
  }, []);

  const updateCheckout = useCallback(
    (nextState: Partial<CheckoutStateType>) =>
      setCheckoutState((prevState) => ({ ...prevState, ...nextState })),
    [checkoutState]
  );

  const subtotal = useMemo(
    () =>
      (checkoutState.items || []).reduce(
        (prevPrice, cartItem) => prevPrice + cartItem.price * cartItem.quantity,
        0
      ),
    [checkoutState]
  );

  const [discountPrice, setDiscountPrice] = useState(0);
  const [shipPrice, setShipPrice] = useState(0);

  useEffect(() => {
    const discount = discounts.find(
      (d) => d.id === checkoutState.discount_code
    );

    if (typeof discount?.amount === "function") {
      discount
        .amount(subtotal)
        .then((amount) => setDiscountPrice(amount))
        .catch(() => setDiscountPrice(0));
    } else {
      setDiscountPrice(0);
    }
  }, [checkoutState.discount_code, subtotal]);

  useEffect(() => {
    const shipMethod = shippingMethods.find(
      (method) => method.id === checkoutState.ship_method
    );

    if (typeof shipMethod?.price === "function") {
      shipMethod
        .price()
        .then((amount) => setShipPrice(amount))
        .catch(() => setShipPrice(0));
    } else {
      setShipPrice(shipMethod?.price || 0);
    }
  }, [checkoutState.ship_method, shippingMethods]);

  const tax = useMemo(() => {
    if (!checkoutState.tax_rate) {
      return 0;
    }

    const taxableAmount = subtotal + shipPrice + discountPrice;
    return Number((taxableAmount * (checkoutState.tax_rate / 100)).toFixed(2));
  }, [checkoutState.tax_rate, subtotal, shipPrice, discountPrice]);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutContext.Provider
        value={{
          complete: orderComplete,
          data: checkoutState,
          discount_price: discountPrice,
          ship_price: shipPrice,
          subtotal,
          tax,
          shippingMethods,
          applyDiscount,
          clearCart,
          updateCart,
          updateCheckout,
        }}
      >
        {children}
      </CheckoutContext.Provider>
    </Elements>
  );
};

export const useCheckout = () =>
  useContext<CheckoutContextType>(CheckoutContext);

export const useTotal = () => {
  const { subtotal, ship_price, discount_price, tax } = useCheckout();
  return calculateTotal({ subtotal, discount_price, ship_price, tax });
};

export const useSubmitOrder = (
  orderHandler: (order: OrderRequestPayload) => Promise<void>
) => {
  const { data, discount_price, ship_price, subtotal, tax } = useCheckout();
  const total = useTotal();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const submitOrder = useCallback(async () => {
    setSubmitting(true);
    setOrderError(null);
    try {
      if (!requiredFields.every((field) => data[field])) {
        throw new Error(
          "Missing required fields. Please complete all fields and try again."
        );
      }
      const address = data.bill_address || data.ship_address;
      const cardElement = elements.getElement(CardNumberElement);
      let paymentToken = "";

      const orderPayload = {
        ...data,
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
        const { paymentIntent } = await stripe.confirmCardPayment(secret, {
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
            },
          },
        });
        paymentToken = paymentIntent.id;
      } else {
        const { paymentIntent } = await stripe.confirmCardPayment(secret);
        paymentToken = paymentIntent.id;
      }

      await orderHandler({
        ...orderPayload,
        paymentToken,
      });
    } catch (err) {
      console.log(err); //eslint-disable-line no-console
      setOrderError(err);
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

function calculateTotal({ subtotal, ship_price, discount_price, tax }) {
  return subtotal - discount_price + ship_price + tax;
}
export const steps = {
  1: "Customer Information",
  2: "Shipping Method",
  3: "Payment Method",
};

export const money = (value?: number | string) => {
  if (typeof value === "undefined" || value === null) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(typeof value === "string" ? parseFloat(value) : value);
};
