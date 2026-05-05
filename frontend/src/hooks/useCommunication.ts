import { useEffect, useState } from "react";
import { useAddCommunication } from "./useApiMutations";

export const useCommunicationForm = (initialBody = "") => {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [messageBody, setMessageBody] = useState(initialBody);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMessageBody(initialBody);
  }, [initialBody]);

  const addCommMutation = useAddCommunication();

  const handleSend = async (title: string, tenantsList: any[]) => {
    // Find matching tenant objects for the selected display strings
    const tenantsToSend = tenantsList.filter((tenant) =>
      selectedTenants.includes(`${tenant.name} — ${tenant.unit}`)
    );

    // Send a message via API for each selected tenant 
    for (const tenant of tenantsToSend) {
      addCommMutation.mutate({
        tenantID: tenant.id,
        unitID: tenant.unitId,
        title: title,
        body: messageBody,
        channel: "email",
      });
    }

    setIsOpen(false);
    setSelectedTenants([]);
    setMessageBody(initialBody);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    selectedTenants,
    setSelectedTenants,
    messageBody,
    setMessageBody,
    handleSend,
    handleCancel,
  };
};
