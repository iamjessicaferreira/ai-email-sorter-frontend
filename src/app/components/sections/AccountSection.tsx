// app/dashboard/components/AccountsSection.tsx
"use client";

import React from "react";
import DisconnectButton from "../DisconnectButton";

type GmailAccount = { uid: string; email: string | null };

type Props = {
  accounts: GmailAccount[];
  loading: boolean;
  onRefresh: () => void;
};

export default function AccountsSection({
  accounts,
  loading,
  onRefresh,
}: Props) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Contas Ativas</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : accounts.length === 0 ? (
        <p>Nenhuma conta conectada.</p>
      ) : (
        <ul className="space-y-1">
          {accounts.map((acc) => (
            <li
              key={acc.uid}
              className="flex items-center justify-between p-2 border rounded"
            >
              <span>{acc.email}</span>
              <DisconnectButton uid={acc.uid} onSuccess={onRefresh} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
