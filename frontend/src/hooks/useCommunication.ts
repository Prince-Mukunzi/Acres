import { useState } from "react";

export const useCommunicationForm = (initialBody = "") => {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [messageBody, setMessageBody] = useState(initialBody);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = () => {
    // Logic for sending the data
    console.log("Sending to:", selectedTenants);
    console.log("Message:", messageBody);

    // Reset and close
    setIsOpen(false);
    setSelectedTenants([]);
    setMessageBody("");
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Optional: Reset fields on cancel
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
