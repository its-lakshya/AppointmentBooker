import { createUser, deleteUser, updateUser } from "@/lib/db/users";
import { UserRole } from "@/types/enums";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export const POST = async (req: Request) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", { status: 400 });
  }

  // Get and stringify body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", { status: 400 });
  }

  const eventType = evt.type;
  // Basic validation
  if (!evt.data.id) {
    return new Response("Error occurred -- missing data", { status: 400 });
  }
  
  try {
    switch (eventType) {
      case "user.created":
        await createUser({
          clerkUserId: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          imageUrl: evt.data?.image_url,
          role: evt.data.public_metadata?.role as UserRole | undefined || UserRole.Admin,
          providerId: evt.data.public_metadata?.provider_id as string | undefined,
          // phoneNumber: evt.data?.phone_numbers[0].phone_number,
        });
        break;

      case "user.updated":
        await updateUser({
          clerkUserId: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          imageUrl: evt.data?.image_url,
          // phoneNumber: evt.data?.phone_numbers[0].phone_number,
        });

        // Check for metadata and update role/provider if present
        const role = evt.data.public_metadata?.role as UserRole | undefined;
        const providerId = evt.data.public_metadata?.provider_id as | string | undefined;

        if (role || providerId) {
          await updateUser({
            clerkUserId: evt.data.id,
            role,
            providerId,
          });
        }
        break;

      case "user.deleted":
        await deleteUser(evt.data.id);
        break;

      default:
        // Ignore other events or handle as needed
        break;
    }
  } catch (error) {
    console.error("Error handling user event:", error);
    return new Response("Error processing event", { status: 500 });
  }

  return new Response("", { status: 200 });
};
