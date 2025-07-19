"use client";

import { useEffect, useState, useCallback } from "react";
import DisconnectButton from "../../components/DisconnectButton";
import Link from "next/link";

type GmailAccount = {
  uid: string;
  email: string | null;
};

export default function SuccessPage() {
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback para garantir a mesma referência ao passar para o botão
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(localStorage.getItem("accessToken"));
      const res = await fetch(
        "http://localhost:8000/api/auth/google-accounts/",
        {
          credentials: "include",
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
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  if (loading) return <p>Carregando contas...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div>
      <Link href="/"> Home </Link>
      <h1>Contas Gmail conectadas</h1>
      <ul>
        {accounts.length === 0 ? (
          <li>Nenhuma conta conectada</li>
        ) : (
          accounts.map((account) => (
            <li
              key={account.uid}
              className="flex items-center justify-between my-2"
            >
              <span>{account.email ?? "Email não disponível"}</span>
              <DisconnectButton uid={account.uid} onSuccess={fetchAccounts} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
