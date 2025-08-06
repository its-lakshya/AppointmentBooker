"use client";
import CreateServiceForm from "@/components/forms/services/CreateServiceForm";
import EmptyState from "@/components/shared/EmptyState";
import { FolderPlus } from "lucide-react";
import { useState } from "react";

const EmptyServices = () => {
  const [showCreateServiceForm, setShowCreateServiceForm] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center text-sm">
      <EmptyState
        icon={FolderPlus}
        title="No services"
        message="Get started by creating new service."
        buttonText="+ Add service"
        onClick={() => setShowCreateServiceForm(true)}
      />
      <CreateServiceForm
        open={showCreateServiceForm}
        setOpen={setShowCreateServiceForm}
      />
    </div>
  );
};

export default EmptyServices;
