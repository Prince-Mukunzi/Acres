import { useEffect, useState } from "react";
import { fetchApi } from "@/utils/api";

export const useCommunicationForm = (initialBody = "") => {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [messageBody, setMessageBody] = useState(initialBody);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMessageBody(initialBody);
  }, [initialBody]);

  const handleSend = async (title: string, tenantsList: any[]) => {
    // Find matching tenant objects for the selected display strings
    const tenantsToSend = tenantsList.filter((tenant) =>
      selectedTenants.includes(`${tenant.name} — ${tenant.unit}`)
    );

    // Send a message via API for each selected tenant 
    for (const tenant of tenantsToSend) {
      try {
        await fetchApi("/api/v1/communication", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantID: tenant.id,
            unitID: tenant.unitId,
            title: title,
            body: messageBody,
          }),
        });
      } catch (error) {
        console.error("Failed to send message to", tenant.name, error);
      }
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
