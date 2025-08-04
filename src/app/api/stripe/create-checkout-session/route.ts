import { getSubscriptionByUserId } from "@/lib/db/subscriptions";
import { stripe } from "@/lib/stripe/stripe";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { userId, email, priceId } = await req.json();

    const subscriptionAlreadyExists = await getSubscriptionByUserId(userId);

    if (subscriptionAlreadyExists) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 409 }
      );
    }

    if (!userId || !email || !priceId) {
      return NextResponse.json(
        { error: "Missing required params" },
        { status: 400 }
      );
    }

    // Check for existing customer
    const existingCustomer = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customerId =
      existingCustomer.data.length > 0 ? existingCustomer.data[0].id : null;

    // Create new customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { userId },
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/payments/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payments/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
