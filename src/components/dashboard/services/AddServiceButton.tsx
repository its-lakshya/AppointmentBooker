"use client";
import CreateServiceForm from "@/components/forms/services/CreateServiceForm";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const AddServiceButton = () => {
  const [showCreateServiceForm, setShowCreateServiceFrom] = useState<boolean>(false);

  return (
    <>
      <Button
        className="absolute right-0 bottom-0"
        onClick={() => setShowCreateServiceFrom(true)}
      >
        + Add service
      </Button>
      <CreateServiceForm
        open={showCreateServiceForm}
        setOpen={setShowCreateServiceFrom}
      />
    </>
  );
};

export default AddServiceButton;
