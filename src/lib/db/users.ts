import { UserRole } from "@/types/enums";
import { createSupabaseAdminClient } from "../supabase/supabase";

type UserParams = {
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  // phoneNumber: string;
  role: UserRole;
  providerId?: string | null
};

type UpdateUserParams = {
  clerkUserId: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  // phoneNumber?: string;
  providerId?: string | null;
  role?: UserRole;
};

export const createUser = async ({
  clerkUserId,
  email,
  firstName,
  lastName,
  imageUrl,
  // phoneNumber.
  role,
  providerId,
}: UserParams) => {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.from("users").insert({
    clerk_user_id: clerkUserId,
    email,
    first_name: firstName,
    last_name: lastName,
    image_url: imageUrl,
    role,
    provider_id: providerId
  }).select();

  if (error || !data) {
    console.log(error)
    throw new Error(`Supabase create error: ${error.message}`);
  }
};

export async function updateUser({
  clerkUserId,
  email,
  firstName,
  lastName,
  imageUrl,
  // phoneNumber,
  providerId,
  role,
}: UpdateUserParams) {
  const supabase = createSupabaseAdminClient();

  //eslint-disable-next-line
  const updatePayload: any = {};

  if (email !== undefined) updatePayload.email = email;
  if (firstName !== undefined) updatePayload.first_name = firstName;
  if (lastName !== undefined) updatePayload.last_name = lastName;
  if (imageUrl !== undefined) updatePayload.image_url = imageUrl;
  // if (phoneNumber !== undefined) updatePayload.phone = phoneNumber;
  if (providerId !== undefined) updatePayload.provider_id = providerId;
  if (role !== undefined) updatePayload.role = role;

  const { error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("clerk_user_id", clerkUserId);

  if (error) throw new Error(`Supabase update error: ${error.message}`);
}

export async function deleteUser(clerkUserId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("clerk_user_id", clerkUserId);

  if (error) throw new Error(`Supabase delete error: ${error.message}`);
}


export async function getUserById(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single(); // Returns only one user

  if (error || !data) {
    console.error("Error fetching user by User ID:", error);
    throw new Error(`Supabase fetch error: ${error?.message}`);
  }
  
  console.log(data)

  return data;
}

export async function getUserByClerkId(clerkUserId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single(); // Returns only one user

  if (error || !data) {
    console.error("Error fetching user by Clerk ID:", error);
    throw new Error(`Supabase fetch error: ${error?.message}`);
  }

  return data;
}
