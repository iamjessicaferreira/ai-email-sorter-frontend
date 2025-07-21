"use client";

import React from "react";
import FetchedEmailsCard from "../FetchedEmailsCard";

type CardCategory = { name: string; description: string };
type Incoming = {
  account: string;
  id: string;
  subject: string;
  body: string;
  summary: string;
  received_at: string;
  category: string;
};

type Props = {
  byAccount: Record<string, Incoming[]>;
  selectedEmails: Set<string>;
  unsubscribedEmails: Set<string>;
  cardCategories: CardCategory[];
  action: "delete" | "unsubscribe";
  onActionChange: (action: "delete" | "unsubscribe") => void;
  onBulkApply: () => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (account: string, sel: boolean) => void;
  onEmailClick: (id: string) => void;
};

export default function EmailsSection({
  byAccount,
  selectedEmails,
  unsubscribedEmails,
  cardCategories,
  action,
  onBulkApply,
  onToggleSelect,
  onSelectAll,
  onEmailClick,
  onActionChange,
}: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">New Emails</h2>
      <div className="flex items-center gap-2">
        <select
          value={action}
          onChange={e => onActionChange(e.target.value as "delete" | "unsubscribe")}
          className="border rounded px-2 py-1"
        >
          <option value="delete">Delete</option>
          <option value="unsubscribe">Unsubscribe</option>
        </select>
        <button
          onClick={onBulkApply}
          disabled={!selectedEmails.size}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Apply
        </button>
      </div>
      {Object.keys(byAccount).length === 0 ? (
        <p>Your new messages will appear here.</p>
      ) : (
        Object.entries(byAccount).map(([accountEmail, emails]) => (
          <FetchedEmailsCard
            key={accountEmail}
            accountEmail={accountEmail}
            categories={cardCategories}
            rawEmails={emails}
            selectedEmails={selectedEmails}
            toggleEmailSelection={onToggleSelect}
            selectAllEmails={sel => onSelectAll(accountEmail, sel)}
            unsubscribedEmails={unsubscribedEmails}
            onEmailClick={onEmailClick}
          />
        ))
      )}
    </section>
  );
}
