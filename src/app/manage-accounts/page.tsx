"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backendUrl } from "../utils/HomeContext";
import { useRouter } from "next/navigation";
import DisconnectButton from "../components/DisconnectButton";
import Header from "../components/Header";

type GmailAccount = { uid: string; email: string | null };

export default function ManageAccountsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [disconnectingAll, setDisconnectingAll] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/auth/success/`, {
          credentials: "include",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setAccounts(data);
        }
      } catch {
        // Error fetching accounts
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
    
    // Listen for account_added parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('account_added') === 'true') {
      // Refresh accounts after a short delay to ensure backend has processed
      setTimeout(() => {
        fetchAccounts();
      }, 1000);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Also refresh on focus/visibility change
    const handleFocus = () => {
      fetchAccounts();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetchAccounts();
      }
    });
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/refresh-token/`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const { has_refresh_token } = await res.json();
      const loginUrl = has_refresh_token
        ? `${backendUrl}/api/auth/login/google-oauth2/`
        : `${backendUrl}/api/auth/login/google-oauth2/?prompt=consent&access_type=offline`;
      window.location.href = loginUrl;
    } catch {
      window.location.href = `${backendUrl}/api/auth/login/google-oauth2/`;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/success/`, {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAccounts(data);
      }
    } catch {
      // Error fetching accounts
    } finally {
      setLoadingAccounts(false);
    }
  };

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
  };

  const handleDisconnectAll = async () => {
    if (accounts.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to disconnect all ${accounts.length} account${accounts.length !== 1 ? 's' : ''}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDisconnectingAll(true);
    const csrftoken = getCookie("csrftoken");
    const results = { success: 0, failed: 0 };

    try {
      for (const account of accounts) {
        try {
          const response = await fetch(`${backendUrl}/api/auth/disconnect-google/`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(csrftoken && { "X-CSRFToken": csrftoken }),
            },
            body: JSON.stringify({ uid: account.uid }),
          });

          if (response.ok) {
            results.success++;
          } else {
            results.failed++;
            const error = await response.json();
            console.error(`Failed to disconnect ${account.email}:`, error);
          }
        } catch (err) {
          results.failed++;
          console.error(`Error disconnecting ${account.email}:`, err);
        }
      }

      if (results.success > 0) {
        alert(`Successfully disconnected ${results.success} account${results.success !== 1 ? 's' : ''}.${results.failed > 0 ? ` Failed to disconnect ${results.failed} account${results.failed !== 1 ? 's' : ''}.` : ''}`);
        await handleRefresh();
        if (results.success === accounts.length) {
          // All accounts disconnected, redirect to login
          router.push("/login");
        }
      } else {
        alert(`Failed to disconnect accounts. Please try again.`);
      }
    } catch (err) {
      alert(`Error: ${err}. Failed to disconnect accounts.`);
    } finally {
      setDisconnectingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Manage Accounts
          </h1>
          <p className="text-gray-600">Connect and manage your Gmail accounts</p>
        </div>

        {accounts.length > 0 && (
          <Card className="shadow-lg border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Active Accounts</CardTitle>
                  <CardDescription>
                    {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
                  </CardDescription>
                </div>
                <Button
                  onClick={handleDisconnectAll}
                  disabled={disconnectingAll}
                  variant="outline"
                  className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                >
                  {disconnectingAll ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect from all accounts"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAccounts ? (
                <div className="text-center py-8">
                  <svg
                    className="animate-spin h-6 w-6 mx-auto text-blue-600"
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
                </div>
              ) : (
                <ul className="space-y-3">
                  {accounts.map((acc) => (
                    <li
                      key={acc.uid}
                      className="flex items-center justify-between p-4 border-2 rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {acc.email?.[0]?.toUpperCase() || 'G'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{acc.email}</p>
                          <p className="text-sm text-gray-500">Gmail Account</p>
                        </div>
                      </div>
                      <DisconnectButton uid={acc.uid} onSuccess={handleRefresh} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg border-2">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-2">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl text-center">Add Gmail Account</CardTitle>
            <CardDescription className="text-center text-base">
              Connect another Gmail account to monitor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-gray-900">Why Gmail login?</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    We need access to your Gmail account to automatically fetch and organize your emails. 
                    Your privacy is important to us—we only read emails to categorize them, and you maintain 
                    full control over your data.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-shadow bg-black text-white hover:bg-gray-800"
              size="lg"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                  Connecting...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Connect with Gmail
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our terms of service and privacy policy
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-2"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}

