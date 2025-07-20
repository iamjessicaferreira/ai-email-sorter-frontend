"use client";

import React, { useEffect, useState } from "react";
import FetchedEmailsCard from "../../components/FetchedEmailsCard";
import { getCookie } from "@/app/utils/cookies";
import Link from "next/link";

type Email = {
  id: string;
  subject: string;
  body: string;
  summary?: string;
  received_at?: string;
  hasReviewedByAI: boolean;
};

type Category = {
  name: string;
  description: string;
  emails: Email[];
};

type AccountEmails = {
  email: string;
  categories: Category[];
  raw_emails: Email[];
};

export default function FetchedEmailsPage() {
  const [data, setData] = useState<AccountEmails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const csrftoken = getCookie("csrftoken");
    setLoading(true);
    fetch("http://localhost:8000/api/fetch-emails/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrftoken && { "X-CSRFToken": csrftoken }),
      },
      body: JSON.stringify({ limit: 5 }),
    })
      .then((res) => res.json())
      .then((json) => setData(json.accounts || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/">← Home</Link>
      <h1 className="text-2xl font-bold mb-6">Fetched Emails</h1>

      {loading && <p>Carregando e-mails...</p>}

      {!loading &&
        data.map((account) => (
          <FetchedEmailsCard
            key={account.email}
            accountEmail={account.email}
            categories={account.categories}
            rawEmails={account.raw_emails}
            selectedEmails={new Set()}              // placeholder até implementar seleção
            toggleEmailSelection={() => {}}         // idem
            selectAllEmails={() => {}}              // idem
          />
        ))}
    </div>
  );
}
