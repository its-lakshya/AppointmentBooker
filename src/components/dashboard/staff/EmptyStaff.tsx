"use client";
import CreateServiceForm from "@/components/forms/services/CreateServiceForm";
import EmptyState from "@/components/shared/EmptyState";
import { ContactRound } from "lucide-react";
import { useState } from "react";

const EmptyStaff = () => {
  const [showCreateServiceForm, setShowCreateServiceForm] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center text-sm">
      <EmptyState
        icon={ContactRound}
        title="No staff member"
        message="Get started by inviting new staff member."
        buttonText="Invite Staff"
        onClick={() => setShowCreateServiceForm(true)}
      />
      <CreateServiceForm
        open={showCreateServiceForm}
        setOpen={setShowCreateServiceForm}
      />
    </div>
  );
};

export default EmptyStaff;


