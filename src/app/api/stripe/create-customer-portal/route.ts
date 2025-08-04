// src/app/api/stripe/customer-portal/route.ts

import { stripe } from "@/lib/stripe/stripe";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const customerId = body.customerId;

  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`, // Update if needed
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 });
  }
};
