import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY);

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(400).end();
  }

  const intentParams = {
    amount: req.body.total.replace(".", ""),
    currency: "usd",
    customer: req.body.customer ?? undefined,
    payment_method: req.body.hasCardElement
      ? undefined
      : req.body.payment_method,
    setup_future_usage: req.body.prefer_save_payment
      ? ("on_session" as const)
      : null,
  };

  const paymentIntent = await stripe.paymentIntents.create(intentParams);

  return res.status(200).json({
    secret: paymentIntent.client_secret,
  });
}
