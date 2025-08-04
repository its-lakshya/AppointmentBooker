import { stripe } from '@/lib/stripe/stripe';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      expand: ['data.product'],
      active: true,
      type: 'recurring',
    });

    const plans = prices.data.map(price => {
        if (typeof price.product !== 'object') return null;

        const product = price.product as Stripe.Product;

        return {
          id: price.id,
          name: product.name,
          description: product.description ?? '',
          price: price.unit_amount ? price.unit_amount / 100 : '',
          interval: price.recurring?.interval ?? 'month',
          price_id: price.id,
        };
      })

    return NextResponse.json(plans);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching subscription plans' }, { status: 500 });
  }
}