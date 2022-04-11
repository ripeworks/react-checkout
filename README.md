# React Checkout

Basic shopping cart checkout frontend for plugging into wherever.

## Support

Currently react-checkout does make some assumptions about your platform.

- Headless styling with tailwindcss class names
- Stripe for payments
- English / US

## Usage

```jsx
import { CheckoutProvider } from "react-checkout";

function App() {
  return (
    <CheckoutProvider>
      <App />
    </CheckoutProvider>
  );
}
```

### Stripe

- Provide a publishable key using `NEXT_PUBLIC_STRIPE_KEY` environment variable.
- Create an `intent.ts` api route, a sample one is included in this repo. You can also roll your own, it should provide a payment intent client secret response.
