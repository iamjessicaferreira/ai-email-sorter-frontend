"use client";

import React, { useEffect, useState } from "react";
import FetchedEmailsCard from "../../components/FetchedEmailsCard";
import { getCookie } from "@/app/utils/cookies";
import router from "next/router";
import Link from "next/link";

type Email = {
  id: string;
  subject: string;
  body: string;
};

type AccountEmails = {
  email: string;
  messages: Email[];
};

export default function FetchedEmailsPage() {
  const [data, setData] = useState<AccountEmails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const csrftoken = getCookie("csrftoken"); // usa a mesma função que você usa no logout

    setLoading(true);
    fetch("http://localhost:8000/api/fetch-emails/", {
      method: "POST",
      credentials: "include", // ESSENCIAL para enviar o cookie de sessão
      headers: {
        "Content-Type": "application/json",
        ...(csrftoken && { "X-CSRFToken": csrftoken }), // ESSENCIAL para Django permitir o POST
      },
    })
      .then((res) => res.json())
      .then((resJson) => setData(resJson.accounts || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {" "}
      <Link href="/"> Home </Link>
      <h1 className="text-2xl font-bold mb-6">Fetched Emails</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        data.map((account) => (
          <FetchedEmailsCard
            key={account.email}
            accountEmail={account.email}
            messages={account.messages.slice(0, 5)} // só os 5 primeiros
          />
        ))
      )}
    </div>
  );
}
