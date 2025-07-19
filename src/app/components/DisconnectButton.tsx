import React from "react";

interface Props {
  uid: string;
  onSuccess: () => void;
}

const DisconnectGoogleButton: React.FC<Props> = ({ uid, onSuccess }) => {
  function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
  }

  const handleDisconnect = async () => {
    const confirm = window.confirm(
      "Tem certeza que deseja desconectar esta conta Google?"
    );
    if (!confirm) return;

    const csrftoken = getCookie("csrftoken");

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/disconnect-google/",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(csrftoken && { "X-CSRFToken": csrftoken }),
          },
          body: JSON.stringify({ uid }),
        }
      );

      if (response.ok) {
        alert("Conta desconectada com sucesso!");
        onSuccess();
      } else {
        const error = await response.json();
        alert("Erro: " + error.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao desconectar a conta.");
    }
  };

  return (
    <button
      onClick={handleDisconnect}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Desconectar Conta
    </button>
  );
};

export default DisconnectGoogleButton;
