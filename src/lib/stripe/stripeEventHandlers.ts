import { stripe } from "@/lib/stripe/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/supabase";
import Stripe from "stripe";

const supabase = createSupabaseAdminClient();

// Handle when the invoice is paid successfully. Called on new subscription and renewals.
export const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  const stripeSubscriptionId = invoice.parent?.subscription_details
    ?.subscription as string;
  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);

  const stripeCustomerId = subscription.customer as string;
  const customer = (await stripe.customers.retrieve(
    stripeCustomerId
  )) as Stripe.Customer;
  const userId = customer.metadata.userId;
  if (!userId) {
    throw new Error("Missing userId in invoice metadata.");
  }
  const priceId = subscription.items.data[0].price.id;
  const status = subscription.status;
  const currentPeriodStart = new Date(
    subscription.items.data[0].current_period_start * 1000
  ).toISOString();
  const currentPeriodEnd = new Date(
    subscription.items.data[0].current_period_end * 1000
  ).toISOString();

  const { data: subscriptionAlreadyExist, error: fetchError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (fetchError) {
    console.error("Error fetching subscription:", fetchError);
  }

  if (subscriptionAlreadyExist) {
    // update subscription
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", stripeSubscriptionId);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw updateError;
    }
    console.log("Subscription updated for invoice.paid");
  } else {
    // Insert new subscription
    const { error: insertError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_price_id: priceId,
      stripe_customer_id: stripeCustomerId,
      status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error inserting subscription:", insertError);
      throw insertError;
    }
    console.log("Subscription created for invoice.paid");
  }
};

/**
 * Maps a Stripe Subscription status to your internal simplified status.
 *
 * @param stripeStatus The status from Stripe's Subscription object.
 * @returns 'active', 'past_due', or 'inactive'.
 */
function mapStripeStatusToInternal(
  stripeStatus: Stripe.Subscription.Status
): "active" | "past_due" | "inactive" {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "inactive";
    default:
      console.warn(
        `[handleCustomerSubscriptionUpdated] Unexpected Stripe subscription status encountered: ${stripeStatus}. Defaulting to 'inactive'.`
      );
      return "inactive";
  }
}

// Handle when the subscription is updated (status, cancellation, etc).

export const handleCustomerSubscriptionUpdated = async (
  subscription: Stripe.Subscription
) => {
  const stripeSubscriptionId = subscription.id;
  const stripeCustomerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id || null;
  const status = mapStripeStatusToInternal(subscription.status);

  const currentPeriodStart = new Date(
    subscription.items.data[0].current_period_start * 1000
  ).toISOString();
  const currentPeriodEnd = new Date(
    subscription.items.data[0].current_period_end * 1000
  ).toISOString();

  if (!stripeSubscriptionId) {
    console.error(
      "[handleCustomerSubscriptionUpdated] Missing subscription ID in customer.subscription.updated event."
    );
    throw new Error("Missing subscription ID for subscription update.");
  }

  try {
    // Attempt to fetch the Customer object to get the userId from its metadata
    let userId: string | undefined;
    if (stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        if (customer && !customer.deleted && customer.metadata?.userId) {
          userId = customer.metadata.userId as string;
        } else {
          console.warn(
            `[handleCustomerSubscriptionUpdated] Customer ${stripeCustomerId} not found, deleted, or missing userId in metadata.`
          );
        }
      } catch (error) {
        // Log but don't re-throw, as existing subscription updates don't strictly need userId
        console.error(
          `[handleCustomerSubscriptionUpdated] Failed to retrieve Stripe Customer ${stripeCustomerId}:`,
          error
        );
      }
    }

    // Check if the subscription already exists in your database
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .single();

    if (fetchError) {
      // PGRST116 means "No rows found"
      console.error(
        "[handleCustomerSubscriptionUpdated] Error fetching subscription:",
        fetchError
      );
    }

    const commonUpdateFields = {
      stripe_price_id: priceId,
      stripe_customer_id: stripeCustomerId,
      status: status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    };

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update(commonUpdateFields)
        .eq("stripe_subscription_id", stripeSubscriptionId);

      if (updateError) {
        console.error(
          "[handleCustomerSubscriptionUpdated] Error updating subscription:",
          updateError
        );
        throw updateError;
      }
      console.log(
        `[handleCustomerSubscriptionUpdated] Subscription ${stripeSubscriptionId} updated to status: ${status}`
      );
    } else {
      // If subscription doesn't exist, it means this is a new subscription.
      // We need the userId to create it.
      console.warn(
        `[handleCustomerSubscriptionUpdated] Subscription ${stripeSubscriptionId} not found in DB, attempting to insert.`
      );

      if (!userId) {
        console.error(
          `[handleCustomerSubscriptionUpdated] Missing userId for new subscription record ${stripeSubscriptionId}. Cannot create subscription without user_id.`
        );
        throw new Error("Missing userId for new subscription record.");
      }

      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId, // Use the fetched userId
          stripe_subscription_id: stripeSubscriptionId,
          created_at: new Date().toISOString(), // Only set on creation
          ...commonUpdateFields,
        });

      if (insertError) {
        console.error(
          "[handleCustomerSubscriptionUpdated] Error inserting new subscription:",
          insertError
        );
        throw insertError;
      }
      console.log(
        `[handleCustomerSubscriptionUpdated] New subscription ${stripeSubscriptionId} inserted with status: ${status}`
      );
    }
  } catch (err) {
    console.error(
      "[handleCustomerSubscriptionUpdated] Unhandled error during subscription update:",
      err
    );
    throw err;
  }
};

// Handle when the subscription is deleted (cancelled).
export const handleCustomerSubscriptionDeleted = async (
  subscription: Stripe.Subscription
) => {
  const subscriptionId = subscription.id;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "inactive",
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_start: null,
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error(
      "Error updating subscription to inactive for Stripe ID:",
      subscriptionId,
      "Error:",
      error.message
    );
    throw new Error(
      `Failed to mark subscription ${subscriptionId} as inactive: ${error.message}`
    );
  }

  console.log(
    `Successfully marked subscription ${subscriptionId} as inactive instead of deleting.`
  );
};

/**
 * Handle `invoice.payment_failed` Stripe webhook event.
 * Use this to notify the user their payment failed.
 */
// export const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
//   const stripeCustomerId = invoice.customer as string;

//   let userId: string | undefined;
//   let customerEmail = invoice.customer_email;

//   try {
//     const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
//     userId = customer.metadata?.userId;

//     if (!customerEmail && !customer.deleted) {
//       customerEmail = customer.email || null;
//     }
//   } catch (err) {
//     console.error("Failed to retrieve Stripe customer:", err);
//   }

//   if (!userId || !customerEmail) {
//     console.warn("Missing userId or email — skipping payment failed handling.");
//     return;
//   }

//   try {
//     // You can log this event to your DB or analytics if needed

//     // Send email notification via Resend
//     const { error } = await resend.emails.send({
//       from: 'YourApp <billing@yourdomain.com>',
//       to: customerEmail,
//       subject: 'Payment Failed – Please Update Your Billing Info',
//       html: `
//         <p>Hi there,</p>
//         <p>We were unable to process your recent payment. Please update your payment method to avoid interruption in service.</p>
//         <p><a href="${process.env.NEXT_PUBLIC_URL}/billing">Update Billing Info</a></p>
//         <p>If you have any questions, contact us at support@yourdomain.com.</p>
//         <p>– YourApp Team</p>
//       `,
//     });

//     if (error) {
//       console.error("Error sending failed payment email via Resend:", error);
//     } else {
//       console.log(`Sent payment failed email to: ${customerEmail}`);
//     }
//   } catch (err) {
//     console.error("handleInvoicePaymentFailed error:", err);
//   }
// };
