import React from "react";
import { backendUrl, useDashboard } from "../utils/HomeContext";
import { Button } from "@/components/ui/button";
import { getCookie } from "../utils/cookies";

interface Props {
  uid: string;
  onSuccess: () => void;
}

const DisconnectButton: React.FC<Props> = ({ uid, onSuccess }) => {
  let resetAccountState: ((uid: string) => void) | undefined;
  try {
    const context = useDashboard();
    resetAccountState = context.resetAccountState;
  } catch {
    // Component can be used outside HomeContext
  }

  const handleDisconnect = async () => {
    const confirmed = window.confirm("Are you sure you want to disconnect this Google account?");
    if (!confirmed) return;

    const csrftoken = getCookie("csrftoken");
    try {
      const response = await fetch(`${backendUrl}/api/auth/disconnect-google/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrftoken && { "X-CSRFToken": csrftoken }),
        },
        body: JSON.stringify({ uid }),
      });

      if (response.ok) {
        alert("Account successfully disconnected.");
        if (resetAccountState) {
          resetAccountState(uid);
        }
        onSuccess();
      } else {
        const error = await response.json();
        alert("Error: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      alert(`${err}, Failed to disconnect the account.`);
    }
  };

  return (
    <Button
      onClick={handleDisconnect}
      variant="outline"
      size="sm"
      tooltip="Disconnect this Gmail account"
      className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      Disconnect
    </Button>
  );
};

export default DisconnectButton;
