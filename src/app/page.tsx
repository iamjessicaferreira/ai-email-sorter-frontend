"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Toast from "./components/Toast";
import Modal from "./components/Modal";
import Sidebar from "./components/Sidebar";
import ConnectSection from "./components/sections/ConnectSection";
import EmailsSection from "./components/sections/EmailsSection";
import { backendUrl, HomeContext } from "./utils/HomeContext";
import { secureFetch } from "./utils/secureFetch";
import { getCookie } from "./utils/cookies";
import { format } from "date-fns";

type ApiCategory = { id: number; name: string; description: string; synonyms?: string[] };
export type CardCategory = { id: number; name: string; description: string; synonyms?: string[] };
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [byAccount, setByAccount] = useState<Record<string, Incoming[]>>({});
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<"delete" | "unsubscribe">("delete");
  const [unsubscribedEmails, setUnsubscribedEmails] = useState<Set<string>>(new Set());
  const [openedEmailId, setOpenedEmailId] = useState<string | null>(null);
  const [openedEmail, setOpenedEmail] = useState<Incoming | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Structure: accountEmail -> categoryName -> Set<emailIds>
  const [unreadEmailsByCategory, setUnreadEmailsByCategory] = useState<Record<string, Record<string, Set<string>>>>({});
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

  const addToast = useCallback((text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((toasts) => [...toasts, { id, text }]);
    setTimeout(() => setToasts((toasts) => toasts.filter((t) => t.id !== id)), 4000);
  }, []);

  const handleUnauthorized = useCallback(() => {
    resetAppState();
    addToast("Sua sessão expirou. Faça login novamente.");
  }, [resetAppState, addToast]);

  const resetAccountState = useCallback((uid: string) => {
    setAccounts((prev) => prev.filter((a) => a.uid !== uid));
    setByAccount((prev) => {
      const next = { ...prev };
      const accountEmails = prev[uid]?.map(e => e.id) || [];
      delete next[uid];
      
      setSelectedEmails((current) => {
        const updated = new Set(current);
        accountEmails.forEach(id => updated.delete(id));
        return updated;
      });
      
      setUnsubscribedEmails((current) => {
        const updated = new Set(current);
        accountEmails.forEach(id => updated.delete(id));
        return updated;
      });
      
      localStorage.setItem("byAccount", JSON.stringify(next));
      return next;
    });
    
    setOpenedEmail((current) => {
      if (current?.account === uid) {
        setOpenedEmailId(null);
        return null;
      }
      return current;
    });
  }, []);

  useEffect(() => {
    const csrftoken = getCookie("csrftoken");
        secureFetch(
          `${backendUrl}/api/categories/`,
          {
            method: "GET",
            credentials: "include",          
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrftoken,     
            },
          },
          handleUnauthorized
        )
          .then((r) => r.json())
          .then((data) => setApiCategories(Array.isArray(data) ? data : []))
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
      addToast("Category added successfully!");
    } catch (e) {
      addToast(`Erro ao adicionar categoria. ${e}`);
    }
  };

  const deleteCategory = async (categoryId: number) => {
    const csrftoken = getCookie("csrftoken");
    try {
      const res = await secureFetch(
        `${backendUrl}/api/categories/${categoryId}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
        },
        handleUnauthorized
      );
      if (res.ok) {
        setApiCategories((prev) => prev.filter((c) => c.id !== categoryId));
        addToast("Category deleted successfully!");
      } else {
        addToast("Error deleting category");
      }
    } catch (e) {
      addToast(`Error deleting category: ${e}`);
    }
  };

  const updateCategory = async (categoryId: number, updatedData: { name: string; description: string }) => {
    const csrftoken = getCookie("csrftoken");
    try {
      const res = await secureFetch(
        `${backendUrl}/api/categories/${categoryId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify(updatedData),
        },
        handleUnauthorized
      );
      if (res.ok) {
        const data = await res.json();
        setApiCategories((prev) =>
          prev.map((c) => (c.id === categoryId ? data : c))
        );
        addToast("Category updated successfully!");
        return true;
      } else {
        addToast("Error updating category");
        return false;
      }
    } catch (e) {
      addToast(`Error updating category: ${e}`);
      return false;
    }
  };



  const fetchAccounts = useCallback(async () => {
    const csrftoken = getCookie("csrftoken");
    setLoadingAccounts(true);
    try {
      const res = await secureFetch(
        `${backendUrl}/api/auth/success/`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
        },
        handleUnauthorized
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setAccounts(data);
        if (data.length === 0) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } else {
        resetAppState();
        setIsAuthenticated(false);
      }
    } catch {
      resetAppState();
      setIsAuthenticated(false);
    } finally {
      setLoadingAccounts(false);
    }
  }, [handleUnauthorized, resetAppState]);
  

  useEffect(() => {
    fetchAccounts();
    
    // Debounce fetchAccounts to prevent too frequent calls
    let fetchTimeout: NodeJS.Timeout | null = null;
    
    const handleFocus = () => {
      // Only fetch if we've been away for at least 30 seconds
      if (fetchTimeout) clearTimeout(fetchTimeout);
      fetchTimeout = setTimeout(() => {
        fetchAccounts();
      }, 30000); // 30 seconds debounce
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only fetch if we've been away for at least 30 seconds
        if (fetchTimeout) clearTimeout(fetchTimeout);
        fetchTimeout = setTimeout(() => {
          fetchAccounts();
        }, 30000); // 30 seconds debounce
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAccounts]);

  // Ensure all connected accounts appear in byAccount, even if they have no emails
  useEffect(() => {
    if (accounts.length > 0) {
      setByAccount((prev) => {
        const updated = { ...prev };
        // Add entries for all accounts, even if they have no emails yet
        accounts.forEach((acc) => {
          if (!updated[acc.email || '']) {
            updated[acc.email || ''] = [];
          }
        });
        return updated;
      });
    }
  }, [accounts]);

  const connectWebSocket = useCallback(() => {
    // Don't connect if not authenticated or no accounts
    if (isAuthenticated === false || (accounts.length === 0 && !loadingAccounts)) {
      console.log('[WebSocket] Skipping connection - not authenticated or no accounts');
      return;
    }
    
    // Don't connect if already connected
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected, skipping');
      return;
    }
    
    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:8000';
    const wsPath = `${wsUrl}/ws/emails/`;
    
    console.log('[WebSocket] Attempting to connect to', wsPath);
    
    try {
      const sock = new WebSocket(wsPath);
      socketRef.current = sock;
      
      sock.onopen = () => {
        console.log('[WebSocket] ✅ Connected successfully to', wsPath);
      };
      
      sock.onmessage = (evt) => {
        try {
          console.log('[WebSocket] Received message:', evt.data);
          const msg: Incoming = JSON.parse(evt.data);
          
          // Ensure account email is valid
          const accountEmail = msg.account || '';
          if (!accountEmail) {
            console.warn('[WebSocket] Received message without account email:', msg);
            return;
          }
          
          // Add email to state, ensuring we don't duplicate
          setByAccount((prev) => {
            const existing = prev[accountEmail] || [];
            // Check if email already exists to avoid duplicates
            const exists = existing.some(e => e.id === msg.id);
            if (exists) {
              console.log('[WebSocket] Email already exists, skipping:', msg.id);
              return prev;
            }
            return { ...prev, [accountEmail]: [msg, ...existing] };
          });
          
          // Show notification for new email with account information
          if (msg.category && msg.category !== 'none') {
            const categoryName = msg.category;
            addToast(`New email in ${categoryName} for ${accountEmail}`);
            
            // Mark email as unread - organized by account and category
            setUnreadEmailsByCategory((prev) => {
              const newState = { ...prev };
              if (!newState[accountEmail]) {
                newState[accountEmail] = {};
              }
              if (!newState[accountEmail][categoryName]) {
                newState[accountEmail][categoryName] = new Set();
              }
              newState[accountEmail][categoryName].add(msg.id);
              return newState;
            });
          } else {
            addToast(`New email (uncategorized) for ${accountEmail}`);
            
            // Mark uncategorized email as unread - organized by account
            setUnreadEmailsByCategory((prev) => {
              const newState = { ...prev };
              if (!newState[accountEmail]) {
                newState[accountEmail] = {};
              }
              if (!newState[accountEmail]["Uncategorized"]) {
                newState[accountEmail]["Uncategorized"] = new Set();
              }
              newState[accountEmail]["Uncategorized"].add(msg.id);
              return newState;
            });
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error, evt.data);
        }
      };
      
      sock.onerror = (error) => {
        // Only log error if we're actually trying to connect (not just a connection attempt that failed silently)
        if (socketRef.current?.readyState === WebSocket.CONNECTING || socketRef.current?.readyState === WebSocket.OPEN) {
          console.warn('[WebSocket] Connection error (this is normal if the server is not running)');
        }
      };
      
      sock.onclose = (event) => {
        const codes: Record<number, string> = {
          1000: 'Normal closure',
          1001: 'Going away',
          1002: 'Protocol error',
          1003: 'Unsupported data',
          1006: 'Abnormal closure (connection lost)',
          4001: 'Unauthorized',
          1011: 'Server error',
          1012: 'Service restart',
          1013: 'Try again later',
          1014: 'Bad gateway',
          1015: 'TLS handshake failed'
        };
        
        const reason = codes[event.code] || `Unknown code: ${event.code}`;
        
        // Only log if it's not a normal closure or unauthorized (which is expected if not authenticated)
        if (event.code !== 1000 && event.code !== 4001) {
          console.log(`[WebSocket] Closed. Code: ${event.code} (${reason}), Reason: ${event.reason || 'No reason provided'}`);
        } else if (event.code === 4001) {
          console.log('[WebSocket] Connection rejected: user not authenticated');
        }
        
        // Only retry if it's not a normal closure, not unauthorized, and we have accounts
        if (event.code !== 1000 && event.code !== 4001 && (accounts.length > 0 || loadingAccounts)) {
          console.log('[WebSocket] Retrying connection in 3 seconds...');
          setTimeout(connectWebSocket, 3000);
        }
      };
    } catch (error) {
      console.warn('[WebSocket] Failed to create WebSocket connection:', error);
    }
  }, [accounts, loadingAccounts, isAuthenticated]);

  useEffect(() => {
    const saved = localStorage.getItem("byAccount");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, Incoming[]>;
        setByAccount(parsed);
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!loadingAccounts && accounts.length > 0) {
      connectWebSocket();
      return () => {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    }
  }, [loadingAccounts, accounts.length, connectWebSocket]);

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
        ? `${backendUrl}/api/delete-emails/`
        : `${backendUrl}/api/unsubscribe-emails/`;

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

  const handleRecategorize = async (emailId: string) => {
    const csrftoken = getCookie("csrftoken");
    try {
      const res = await secureFetch(
        `${backendUrl}/api/emails/${emailId}/recategorize/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
        },
        handleUnauthorized
      );

      if (res.ok) {
        const data = await res.json();
        const updatedEmail = data.email;
        const newCategory = updatedEmail.category || data.category || null;
        
        // Update the email in byAccount state
        setByAccount((prev) => {
          const next = { ...prev };
          for (const [account, emails] of Object.entries(next)) {
            const emailIndex = emails.findIndex((e) => e.id === emailId);
            if (emailIndex !== -1) {
              next[account] = [...emails];
              next[account][emailIndex] = {
                ...emails[emailIndex],
                category: newCategory || "none",
              };
              break;
            }
          }
          return next;
        });
        
        addToast(`Email recategorized to: ${newCategory || "Uncategorized"}`);
      } else {
        let errorMessage = "Unknown error";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.detail || `HTTP ${res.status}: ${res.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${res.status}: ${res.statusText || "Failed to recategorize email"}`;
        }
        addToast(`Error recategorizing email: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error) || "Network error or unknown issue";
      addToast(`Error recategorizing email: ${errorMessage}`);
      console.error("Recategorize error:", error);
    }
  };

  const cardCategories: CardCategory[] = apiCategories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    synonyms: c.synonyms,
  }));

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success' || urlParams.get('account_added') === 'true') {
      fetchAccounts();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchAccounts]);

  if (isAuthenticated === false && !loadingAccounts && accounts.length === 0) {
    window.location.href = "/login";
    return null;
  }

  if (isAuthenticated === null || loadingAccounts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg
            className="animate-spin h-8 w-8 mx-auto text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <HomeContext.Provider value={{ resetAccountState, resetAppState }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Sidebar />
        <main className="lg:ml-64">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-slide-in mb-2">
                    Email Dashboard
                  </h1>
                  <p className="text-gray-600 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                    Organize and manage your emails with AI
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-elegant border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Categories</p>
                        <p className="text-2xl font-bold text-gray-900">{cardCategories.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <ConnectSection
                  cardCategories={cardCategories}
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  addCategory={addCategory}
                  onDeleteCategory={deleteCategory}
                  onUpdateCategory={updateCategory}
                />
              </div>

              <div className="lg:col-span-2">
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
          onRecategorize={handleRecategorize}
          unreadEmailsByCategory={unreadEmailsByCategory}
          accounts={accounts}
          onCategoryOpened={(accountEmail, categoryName, emailIds) => {
            // Mark emails as read when category is opened - organized by account
            setUnreadEmailsByCategory((prev) => {
              const newState = { ...prev };
              if (newState[accountEmail] && newState[accountEmail][categoryName]) {
                const newSet = new Set(newState[accountEmail][categoryName]);
                emailIds.forEach(id => newSet.delete(id));
                if (newSet.size === 0) {
                  delete newState[accountEmail][categoryName];
                  // Clean up empty account entry
                  if (Object.keys(newState[accountEmail]).length === 0) {
                    delete newState[accountEmail];
                  }
                } else {
                  newState[accountEmail][categoryName] = newSet;
                }
              }
              return newState;
            });
          }}
                />
              </div>
            </div>
          </div>
        </main>

        <div className="fixed top-4 right-4 space-y-2 z-50">
          {toasts.map((t, index) => (
            <div 
              key={t.id} 
              className="animate-slide-in-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Toast message={t.text} onDone={() => setToasts((all) => all.filter((x) => x.id !== t.id))} />
            </div>
          ))}
        </div>

        <Modal
          isOpen={!!openedEmailId}
          onClose={() => {
            setOpenedEmailId(null);
            setOpenedEmail(null);
          }}
        >
          {loadingEmail ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <svg
                  className="animate-spin h-8 w-8 mx-auto text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600">Loading email...</p>
              </div>
            </div>
          ) : openedEmail ? (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {openedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{format(new Date(openedEmail.received_at), "dd/MM/yyyy 'às' HH:mm")}</span>
                      </div>
                      {openedEmail.category && openedEmail.category !== 'none' && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                            {openedEmail.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div 
                  className="
                    email-content text-gray-700 leading-relaxed
                    [&_p]:mb-4 [&_p]:text-base
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4
                    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                    [&_li]:mb-2
                    [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                    [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4
                    [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
                    [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                    [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
                  "
                  dangerouslySetInnerHTML={{ __html: openedEmail.body }} 
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg">Could not load email.</p>
            </div>
          )}
        </Modal>
      </div>
    </HomeContext.Provider>
  );
}
