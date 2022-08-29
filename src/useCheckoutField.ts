import { useCallback } from "react";
import { useCheckout } from "./Checkout";

export const useCheckoutField = (name: string) => {
  const { data, updateCheckout } = useCheckout();

  const onChange = useCallback(
    (eventOrValue) => {
      const value = eventOrValue?.target?.value ?? eventOrValue;
      updateCheckout({
        [name]: value,
      });
    },
    [name]
  );

  return {
    value: (data as any)[name],
    onChange,
  };
};
