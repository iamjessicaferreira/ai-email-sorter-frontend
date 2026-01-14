import React from "react";
import { backendUrl, useDashboard } from "../utils/HomeContext";

interface Props {
  uid: string;
  onSuccess: () => void;
}

const DisconnectButton: React.FC<Props> = ({ uid, onSuccess }) => {
  let resetAccountState: ((uid: string) => void) | undefined;
  try {
    const { resetAccountState: reset } = useDashboard();
    resetAccountState = reset;
  } catch {
    // Not in HomeContext, that's okay
  }

  function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
  }

  const handleDisconnect = async () => {
    const confirmed = window.confirm("Are you sure you want to disconnect this Google account?");
    if (!confirmed) return;

    const csrftoken = getCookie("csrftoken");
    try {
      const response = await fetch( `${backendUrl}/api/auth/disconnect-google/`, {
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
    <button
      onClick={handleDisconnect}
      className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
    >
      Disconnect
    </button>
  );
};

export default DisconnectButton;
