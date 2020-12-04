/* global Intl */

export const money = (value?: number | string) => {
  if (typeof value === "undefined" || value === null) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(typeof value === "string" ? parseFloat(value) : value);
};
