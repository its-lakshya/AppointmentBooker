"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const AddBookingLinkButton = () => {
  const router = useRouter();
  return (
    <>
      <Button
        className="absolute right-0 bottom-0"
        onClick={() => router.push("/dashboard/booking-links/create-booking-link")}
      >
        + Add booking link
      </Button>
    </>
  );
};

export default AddBookingLinkButton;
