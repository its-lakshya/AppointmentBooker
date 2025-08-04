import { clerkClient } from "@clerk/nextjs/server";

export async function inviteStaff({
  email,
  providerId,
}: {
  email: string;
  providerId: string;
}) {
  const clerk = await clerkClient();
  return await clerk.invitations.createInvitation({
    emailAddress: email,
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`, // or wherever you want
    publicMetadata: {
      role: "staff",
      provider_id: providerId,
    },
  });
}