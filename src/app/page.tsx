// app/dashboard/page.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import Toast from "./components/Toast";
import Modal from "./components/Modal";
import ConnectSection from "./components/sections/ConnectSection";
import AccountsSection from "./components/sections/AccountSection";
import EmailsSection from "./components/sections/EmailsSection";
import { HomeContext } from "./utils/homeContext";


type ApiCategory = { id: number; name: string; description: string };
type CardCategory = { name: string; description: string };
type GmailAccount = { uid: string; email: string | null };
type Incoming = {
  account: string;
  id: string;
  subject: string;
  body: string;
  summary: string;
  received_at: string;
  category: string;
};
type ToastMessage = { id: string; text: string };

export default function DashboardPage() {
  // --- state & refs ---
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [newCat, setNewCat] = useState<Omit<ApiCategory, "id">>({ name: "", description: "" });
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [byAccount, setByAccount] = useState<Record<string, Incoming[]>>({});
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<"delete" | "unsubscribe">("delete");
  const [unsubscribedEmails, setUnsubscribedEmails] = useState<Set<string>>(new Set());
  const [openedEmailId, setOpenedEmailId] = useState<string | null>(null);
  const [openedEmail, setOpenedEmail] = useState<Incoming | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  

  const resetAccountState = (uid: string) => {
    setAccounts((prev) => prev.filter((a) => a.uid !== uid));
    setByAccount((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
    setSelectedEmails((prev) => {
      // Remove seleções de emails desse uid
      const allIds = byAccount[uid]?.map(e => e.id) || [];
      const nxt = new Set(prev);
      allIds.forEach(id => nxt.delete(id));
      return nxt;
    });
    setUnsubscribedEmails((prev) => {
      const allIds = byAccount[uid]?.map(e => e.id) || [];
      const nxt = new Set(prev);
      allIds.forEach(id => nxt.delete(id));
      return nxt;
    });
    // Se o email aberto for dessa conta, feche:
    if (openedEmail && openedEmail.account === uid) {
      setOpenedEmail(null);
      setOpenedEmailId(null);
    }
    // Atualize o localStorage:
    setTimeout(() => {
      // Espera o próximo ciclo do React
      localStorage.setItem("byAccount", JSON.stringify((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      }));
    }, 0);
  };

  const addToast = (text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const getCookie = (name: string) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] || "";

  // 1) Fetch categories
  useEffect(() => {
    fetch("http://localhost:8000/api/categories/", { credentials: "include" })
      .then((r) => r.json())
      .then(setApiCategories)
      .catch(console.error);
  }, []);

  const addCategory = async () => {
    const csrftoken = getCookie("csrftoken");
    const res = await fetch("http://localhost:8000/api/categories/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      body: JSON.stringify(newCat),
    });
    if (res.ok) {
      const created: ApiCategory = await res.json();
      setApiCategories((old) => [...old, created]);
      setNewCat({ name: "", description: "" });
    }
  };

  // 2) Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/success/", { credentials: "include" });
      setAccounts(await res.json());
    } catch {
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // 3) OAuth flow
  const handleAddAccount = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/refresh-token/", { credentials: "include" });
      if (!res.ok) throw new Error();
      const { has_refresh_token } = await res.json();
      const loginUrl = has_refresh_token
        ? "http://localhost:8000/api/auth/login/google-oauth2/"
        : "http://localhost:8000/api/auth/login/google-oauth2/?prompt=consent&access_type=offline";
      window.location.href = loginUrl;
    } catch {
      window.location.href = "http://localhost:8000/api/auth/login/google-oauth2/";
    }
  };

  // 4) WebSocket for incoming emails
  const connectWebSocket = () => {
    const sock = new WebSocket("ws://localhost:8000/ws/emails/");
    socketRef.current = sock;
    sock.onopen = () => console.log("WS connected");
    sock.onmessage = (evt) => {
      const msg: Incoming = JSON.parse(evt.data);
      setByAccount((prev) => ({ ...prev, [msg.account]: [msg, ...(prev[msg.account] || [])] }));
    };
    sock.onclose = () => {
      console.log("WS closed, retry in 1s");
      setTimeout(connectWebSocket, 1000);
    };
  };

  useEffect(() => {
    const saved = localStorage.getItem("byAccount");
    if (saved) {
      try {
        setByAccount(JSON.parse(saved));
      } catch {}
    }
    connectWebSocket();
    return () => socketRef.current?.close();
  }, []);

  useEffect(() => {
    localStorage.setItem("byAccount", JSON.stringify(byAccount));
  }, [byAccount]);

  // 5) Bulk actions
  const toggleEmailSelection = (id: string) =>
    setSelectedEmails((prev) => {
      const nxt = new Set(prev);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });

  const selectAllInAccount = (acc: string, sel: boolean) =>
    setSelectedEmails((prev) => {
      const nxt = new Set(prev);
      (byAccount[acc] || []).forEach((e) => (sel ? nxt.add(e.id) : nxt.delete(e.id)));
      return nxt;
    });

  const applyBulk = async () => {
    if (!selectedEmails.size) {
      addToast("Selecione pelo menos um e‑mail.");
      return;
    }

    const csrftoken = getCookie("csrftoken");
    const endpoint =
      action === "delete"
        ? "http://localhost:8000/api/delete-emails/"
        : "http://localhost:8000/api/unsubscribe-emails/";

    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      body: JSON.stringify({ email_ids: Array.from(selectedEmails) }),
    });

    if (!res.ok && res.status !== 207) {
      const text = await res.text();
      addToast(`Erro ${res.status}: ${text}`);
      return;
    }


    const data = (await res.json()) as any;
    console.log(data, "data")
    if (action === "unsubscribe") {
      if (Array.isArray(data.not_found) && data.not_found.length) {
        addToast(`Nenhum link encontrado em ${data.not_found.length} e‑mails.`);
      }
      if (Array.isArray(data.success_ids) && data.success_ids.length) {
        setUnsubscribedEmails((prev) => {
          const nxt = new Set(prev);
          data.success_ids.forEach((id: string) => nxt.add(id));
          return nxt;
        });
        addToast(`Unsubscribed em ${data.success_ids.length} e‑mails.`);
      }
      
    } else {
      if (Array.isArray(data.successes) && data.successes.length) {
        setByAccount((prev) => {
          const toRemove = new Set(data.successes);
          const next: Record<string, Incoming[]> = {};
          for (const [acct, msgs] of Object.entries(prev)) {
            next[acct] = msgs.filter((m) => !toRemove.has(m.id));
          }
          console.log('byAccount after delete:', next);
          return next;
        });
        addToast(`Deletados ${data.successes.length} e‑mails.`);
      }
      if (Array.isArray(data.failures) && data.failures.length) {
        addToast(`${data.failures.length} falhas ao deletar.`);
      }
    }

    setSelectedEmails(new Set());
  };

  // 6) Open full email in modal
  const openEmail = async (id: string) => {
    setOpenedEmailId(id);
    setLoadingEmail(true);
    const res = await fetch(`http://localhost:8000/api/emails/${id}/`, { credentials: "include" });
    if (res.ok) {
      setOpenedEmail(await res.json());
    } else {
      addToast("Erro ao carregar e‑mail.");
    }
    setLoadingEmail(false);
  };

  // Prepare card categories
  const cardCategories: CardCategory[] = apiCategories.map((c) => ({
    name: c.name,
    description: c.description,
  }));

  return (
    <>
      <HomeContext.Provider  value={{ resetAccountState }}>
              <main className="p-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">AI Email Sorter</h1>

        <ConnectSection
          newCat={newCat}
          setNewCat={setNewCat}
          addCategory={addCategory}
          handleAddAccount={handleAddAccount}
        />

        <AccountsSection
          accounts={accounts}
          loading={loadingAccounts}
          onRefresh={fetchAccounts}
        />

        <EmailsSection
          byAccount={byAccount}
          selectedEmails={selectedEmails}
          unsubscribedEmails={unsubscribedEmails}
          cardCategories={cardCategories}
          action={action}
          onBulkApply={applyBulk}
          onToggleSelect={toggleEmailSelection}
          onSelectAll={selectAllInAccount}
          onEmailClick={openEmail}
          onActionChange={setAction} 
        />

        {/* Toasters */}
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {toasts.map((t) => (
            <Toast key={t.id} message={t.text} onDone={() => setToasts((all) => all.filter((x) => x.id !== t.id))} />
          ))}
        </div>
      </main>

      {/* Full-email Modal */}
      <Modal
        isOpen={!!openedEmailId}
        onClose={() => {
          setOpenedEmailId(null);
          setOpenedEmail(null);
        }}
      >
        {loadingEmail ? (
          <p>Carregando...</p>
        ) : openedEmail ? (
          <>
            <h2 className="text-xl font-bold">{openedEmail.subject}</h2>
            <p className="text-xs text-gray-500">
              {new Date(openedEmail.received_at).toLocaleString()}
            </p>
            <div className="mt-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: openedEmail.body }} />
          </>
        ) : (
          <p>Não foi possível carregar o e‑mail.</p>
        )}
      </Modal>
      </HomeContext.Provider>

    </>
  );
}
