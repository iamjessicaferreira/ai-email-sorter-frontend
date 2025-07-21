"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Toast from "./components/Toast";
import Modal from "./components/Modal";
import ConnectSection from "./components/sections/ConnectSection";
import AccountsSection from "./components/sections/AccountSection";
import EmailsSection from "./components/sections/EmailsSection";
import { backendUrl, HomeContext } from "./utils/HomeContext";
import { secureFetch } from "./utils/secureFetch";
import { format } from "date-fns";

type ApiCategory = { id: number; name: string; description: string };
export type CardCategory = { name: string; description: string };
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
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [newCategory, setNewCategory] = useState<Omit<ApiCategory, "id">>({ name: "", description: "" });
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

  const resetAppState = useCallback(() => {
    setAccounts([]);
    setByAccount({});
    setSelectedEmails(new Set());
    setUnsubscribedEmails(new Set());
    setOpenedEmailId(null);
    setOpenedEmail(null);
    setApiCategories([]);
    localStorage.removeItem("byAccount");
  }, []);

 const handleUnauthorized = useCallback(() => {
    resetAppState();
    addToast("Sua sessão expirou. Faça login novamente.");
  }, [resetAppState]);

  const resetAccountState = (uid: string) => {
    setAccounts((prev) => prev.filter((a) => a.uid !== uid));
    setByAccount((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
    setSelectedEmails((prev) => {
      const allIds = byAccount[uid]?.map(e => e.id) || [];
      const next = new Set(prev);
      allIds.forEach(id => next.delete(id));
      return next;
    });
    setUnsubscribedEmails((prev) => {
      const allIds = byAccount[uid]?.map(e => e.id) || [];
      const next = new Set(prev);
      allIds.forEach(id => next.delete(id));
      return next;
    });
    if (openedEmail && openedEmail.account === uid) {
      setOpenedEmail(null);
      setOpenedEmailId(null);
    }
    setTimeout(() => {
      localStorage.setItem("byAccount", JSON.stringify((prev: Record<string, Incoming[]>) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      }));
    }, 0);
  };

  const addToast = (text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((toasts) => [...toasts, { id, text }]);
    setTimeout(() => setToasts((toasts) => toasts.filter((t) => t.id !== id)), 4000);
  };

  const getCookie = (name: string) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] || "";

      useEffect(() => {
        secureFetch(
          `${backendUrl}/api/categories/`,
          {},
          handleUnauthorized
        )
          .then((r) => r.json())
          .then(setApiCategories)
          .catch(() => setApiCategories([]));
      
  }, [handleUnauthorized]);

const addCategory = async () => {
  const csrftoken = getCookie("csrftoken");
  try {
    const res = await secureFetch(
      `${backendUrl}/api/categories/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(newCategory),
      },
      handleUnauthorized
    );
    const data = await res.json();
    setApiCategories((prev) => [...prev, data]);
    setNewCategory({ name: "", description: "" });
  } catch (e) {
    addToast(`Erro ao adicionar categoria. ${e}`);
  }
};



  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await secureFetch(
        `${backendUrl}/api/auth/success/`,
        {},
        handleUnauthorized
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAccounts(data);
      } else {
        resetAppState();
      }
    } catch {
      resetAppState();
    } finally {
      setLoadingAccounts(false);
    }
  }, [handleUnauthorized, resetAppState]);
  

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = async () => {
    try {
      const res = await fetch( `${backendUrl}/api/auth/refresh-token/`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const { has_refresh_token } = await res.json();
      const loginUrl = has_refresh_token
        ?  `${backendUrl}/api/auth/login/google-oauth2/`
        :  `${backendUrl}/api/auth/login/google-oauth2/?prompt=consent&access_type=offline`;
      window.location.href = loginUrl;
    } catch {
      window.location.href =  `${backendUrl}/api/auth/login/google-oauth2/`;
    }
  };

  const connectWebSocket = () => {
    const sock = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_WS_URL}/ws/emails/`);
    socketRef.current = sock;
    sock.onopen = () => {};
    sock.onmessage = (evt) => {
      const msg: Incoming = JSON.parse(evt.data);
      setByAccount((prev) => ({ ...prev, [msg.account]: [msg, ...(prev[msg.account] || [])] }));
    };
    sock.onclose = () => {
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

  const toggleEmailSelection = (id: string) =>
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAllInAccount = (acc: string, selectAll: boolean) =>
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      (byAccount[acc] || []).forEach((e) => (selectAll ? next.add(e.id) : next.delete(e.id)));
      return next;
    });

  const applyBulk = async () => {
    if (!selectedEmails.size) {
      addToast("Select at least one email.");
      return;
    }

    const csrftoken = getCookie("csrftoken");
    const endpoint =
      action === "delete"
        ?  `${backendUrl}/api/delete-emails/`
        :  `${backendUrl}/api/unsubscribe-emails/`;

    const res = await secureFetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      body: JSON.stringify({ email_ids: Array.from(selectedEmails) }),
    }, handleUnauthorized);

    if (!res.ok && res.status !== 207) {
      const text = await res.text();
      addToast(`Error ${res.status}: ${text}`);
      return;
    }

    const data = await res.json();
    if (action === "unsubscribe") {
      if (Array.isArray(data.failures) && data.failures.length) {
        data.failures.forEach((failure: { subject?: string; id: string; error: string }) => {
          const display = failure.subject || failure.id;
          addToast(`"${display}": ${failure.error}`);
        });
      }
      if (Array.isArray(data.success_ids) && data.success_ids.length) {
        setUnsubscribedEmails((prev) => {
          const next = new Set(prev);
          data.success_ids.forEach((id: string) => next.add(id));
          return next;
        });
        addToast(`Unsubscribed from ${data.success_ids.length} emails.`);
      }
    } else {
      if (Array.isArray(data.successes) && data.successes.length) {
        setByAccount((prev) => {
          const toRemove = new Set(data.successes);
          const next: Record<string, Incoming[]> = {};
          for (const [acct, msgs] of Object.entries(prev)) {
            next[acct] = msgs.filter((m) => !toRemove.has(m.id));
          }
          return next;
        });
        addToast(`Deleted ${data.successes.length} emails.`);
      }
      if (Array.isArray(data.failures) && data.failures.length) {
        addToast(`${data.failures.length} failures while deleting.`);
      }
    }

    setSelectedEmails(new Set());
  };

  const openEmail = async (id: string) => {
    setOpenedEmailId(id);
    setLoadingEmail(true);
    try {
      const res = await secureFetch(
         `${backendUrl}/api/emails/${id}/`,
        {},
        handleUnauthorized
      );
      if (res.ok) {
        setOpenedEmail(await res.json());
      } else {
        addToast("Error loading email.");
      }
    } catch {
      addToast("Error loading email.");
    }
    setLoadingEmail(false);
  };

  const cardCategories: CardCategory[] = Array.isArray(apiCategories)
  ? apiCategories.map((c) => ({
      name: c.name,
      description: c.description,
    }))
  : [];

  return (
    <HomeContext.Provider value={{ resetAccountState, resetAppState }}>
      <main className="p-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">AI Email Sorter</h1>

        <ConnectSection
          cardCategories={cardCategories}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
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

        <div className="fixed top-4 right-4 space-y-2 z-50">
          {toasts.map((t) => (
            <Toast key={t.id} message={t.text} onDone={() => setToasts((all) => all.filter((x) => x.id !== t.id))} />
          ))}
        </div>
      </main>

      <Modal
        isOpen={!!openedEmailId}
        onClose={() => {
          setOpenedEmailId(null);
          setOpenedEmail(null);
        }}
      >
        {loadingEmail ? (
          <p>Loading...</p>
        ) : openedEmail ? (
          <>
            <h2 className="text-xl font-bold">{openedEmail.subject}</h2>
            <p className="text-xs text-gray-500">
              {format(new Date(openedEmail.received_at), "dd/MM/yyyy HH:mm")}
            </p>
            <div className="mt-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: openedEmail.body }} />
          </>
        ) : (
          <p>Could not load email.</p>
        )}
      </Modal>
    </HomeContext.Provider>
  );
}
