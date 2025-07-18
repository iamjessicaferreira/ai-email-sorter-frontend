"use client";

import { useEffect, useState } from "react";

type GmailAccount = {
  email: string;
};

export default function SuccessPage() {
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setLoading(true);
        const res = await fetch(
          "http://localhost:8000/api/auth/google-accounts/",
          {
            credentials: "include", // importante para cookies / sessão se você usar
          }
        );

        if (!res.ok) {
          throw new Error(`Erro ao buscar contas: ${res.statusText}`);
        }

        const data: GmailAccount[] = await res.json();
        setAccounts(data);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  if (loading) return <p>Carregando contas...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div>
      <h1>Contas Gmail conectadas</h1>
      <ul>
        {accounts.length === 0 ? (
          <li>Nenhuma conta conectada</li>
        ) : (
          accounts.map(({ email }) => <li key={email}>{email}</li>)
        )}
      </ul>
    </div>
  );
}
