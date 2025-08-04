import { stripe } from "@/lib/stripe/stripe";
import {
  handleCustomerSubscriptionDeleted,
  handleCustomerSubscriptionUpdated,
  handleInvoicePaid,
} from "@/lib/stripe/stripeEventHandlers";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error(error);
    return new Response("Error occured in webhook", { status: 400 });
  }

  const eventType = event.type;

  switch (eventType) {
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "customer.subscription.updated":
      await handleCustomerSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      );
      break;
    case "customer.subscription.deleted":
      await handleCustomerSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      );
      break;
    default:
      console.log("Unhandeled Event Type:", eventType);
  }

  return new NextResponse("Webhook received", { status: 200 });
}
