'use client'

import { useAuth, useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

export const IdentifyWithPostHog = () => {
  const { isSignedIn, userId } = useAuth();
  const { user, isLoaded } = useUser();

  // useRef is used here to store a persistent "hasIdentified" flag
  // that survives across re-renders without triggering a re-render itself.
  // This helps ensure posthog.identify() is only called once per session,
  // even if the component re-renders or runs again (e.g., in dev or hydration).
  const hasIdentified = useRef(false); // <-- track whether we've already identified the user

  useEffect(() => {
    // Only run once per session
    if (!isSignedIn || !userId || !isLoaded || hasIdentified.current) return;

    hasIdentified.current = true; // mark as identified so it doesn't run again

    posthog.identify(userId, {
      email: user?.emailAddresses?.[0]?.emailAddress,
      name: user?.fullName,
    });
  }, [isSignedIn, userId, user, isLoaded]);

  return null;
}

export default IdentifyWithPostHog;