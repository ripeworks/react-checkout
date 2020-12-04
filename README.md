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
