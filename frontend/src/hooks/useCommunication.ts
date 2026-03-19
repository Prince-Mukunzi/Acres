import { useEffect, useState } from "react";

export const useCommunicationForm = (initialBody = "") => {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [messageBody, setMessageBody] = useState(initialBody);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMessageBody(initialBody);
  }, [initialBody]);

  const handleSend = () => {
    console.log("Sending to:", selectedTenants);
    console.log("Message:", messageBody);

    setIsOpen(false);
    setSelectedTenants([]);
    setMessageBody("");
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
