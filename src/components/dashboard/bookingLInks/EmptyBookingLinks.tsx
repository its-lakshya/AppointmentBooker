"use client";
import CreateServiceForm from "@/components/forms/services/CreateServiceForm";
import EmptyState from "@/components/shared/EmptyState";
import { FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EmptyBookingLinks = () => {
  const router = useRouter();
  const [showCreateServiceForm, setShowCreateServiceForm] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center text-sm">
      <EmptyState
        icon={FolderPlus}
        title="No booking links"
        message="Get started by creating new booking link."
        buttonText="Add booking link"
        onClick={() => router.push('/dashboard/booking-links/create-booking-link')}
      />
      <CreateServiceForm
        open={showCreateServiceForm}
        setOpen={setShowCreateServiceForm}
      />
    </div>
  );
};

export default EmptyBookingLinks;