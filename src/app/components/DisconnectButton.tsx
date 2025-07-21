import React from "react";
import { backendUrl, useDashboard } from "../utils/HomeContext";

interface Props {
  uid: string;
  onSuccess: () => void;
}

const DisconnectButton: React.FC<Props> = ({ uid, onSuccess }) => {
  const { resetAccountState } = useDashboard();

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
        resetAccountState(uid);
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
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Disconnect Account
    </button>
  );
};

export default DisconnectButton;
