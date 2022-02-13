import { Elements } from "@stripe/react-stripe-js";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import storage from "local-storage-fallback";
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  checkboxLabelStyles,
  inputStyles,
  legendStyles,
  radioLabelStyles,
  selectStyles,
} from "./constants";

/* eslint-disable camelcase */

export type StyleNames = "legend" | "input" | "select" | "radio" | "checkbox";

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
  styles: Record<StyleNames, string>;
  applyDiscount: (discount: string) => Error | void;
  clearCart: () => void;
  updateCheckout: (nextState: Partial<CheckoutStateType>) => void;
  updateCart: (item: Item) => void;
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
  discount_code: undefined,
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
  styles: {
    checkbox: checkboxLabelStyles,
    input: inputStyles,
    legend: legendStyles,
    radio: radioLabelStyles,
    select: selectStyles,
  },
  subtotal: 0,
  tax: 0,
  applyDiscount: () => {},
  clearCart: () => {},
  updateCheckout: () => {},
  updateCart: () => {},
};

const CheckoutContext = createContext<CheckoutContextType>(initialContext);

let stripePromise: Promise<Stripe | null>;

type Props = {
  children: React.ReactNode;
  discounts?: Discount[];
  shippingMethods: ShippingMethod[];
  storageKey?: string;
  styles?: Partial<Record<StyleNames, string>>;
  stripeAccount?: string;
};

export const CheckoutProvider = ({
  children,
  discounts = [],
  shippingMethods = [],
  storageKey = "checkoutState",
  styles,
  stripeAccount = undefined,
}: Props) => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY ?? "", {
      stripeAccount,
    });
  }

  const [checkoutState, setCheckoutState] = useState(initialState);
  const [orderComplete, setOrderComplete] = useState(false);

  const checkoutStyles = useMemo(
    () => ({
      checkbox: styles?.checkbox ?? checkboxLabelStyles,
      input: styles?.input ?? inputStyles,
      legend: styles?.legend ?? legendStyles,
      radio: styles?.radio ?? radioLabelStyles,
      select: styles?.select ?? selectStyles,
    }),
    [styles]
  );

  useEffect(() => {
    try {
      const hydratedState = JSON.parse(storage.getItem(storageKey) ?? "");
      if (hydratedState) {
        setCheckoutState(hydratedState);
      }
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
          styles: checkoutStyles,
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
