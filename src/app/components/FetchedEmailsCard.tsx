// components/FetchedEmailsCard.tsx
import React from "react";

type Email = {
  id: string;
  subject: string;
  body: string;
};

type FetchedEmailsCardProps = {
  accountEmail: string;
  messages: Email[];
};

export default function FetchedEmailsCard({
  accountEmail,
  messages,
}: FetchedEmailsCardProps) {
  return (
    <div className="border rounded-xl p-4 shadow-md bg-white mb-6">
      <h2 className="text-xl font-bold mb-3">{accountEmail}</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500">Nenhum e-mail encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="p-3 border rounded-md bg-gray-50">
              <h3 className="font-semibold text-lg">{msg.subject}</h3>
              <div
                className="mt-2 text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: msg.body }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
