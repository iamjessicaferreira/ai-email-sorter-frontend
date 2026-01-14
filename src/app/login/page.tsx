"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backendUrl } from "../utils/HomeContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccounts, setHasAccounts] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccounts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/auth/success/`, {
          credentials: "include",
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHasAccounts(true);
          // If user already has accounts, redirect to manage-accounts
          router.push("/manage-accounts");
        }
      } catch {
        // Not authenticated or no accounts
      }
    };
    checkAccounts();
  }, [router]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Email Sorter
          </h1>
          <p className="text-xl font-semibold text-gray-800">Organize your emails with the power of AI</p>
          <div className="space-y-4 pt-2 max-w-4xl mx-auto">
            <p className="text-gray-700 leading-relaxed text-lg">
              Monitor all your Gmail accounts in one place, powered by artificial intelligence. 
              Automatically categorize your emails, create custom categories, and have complete control 
              over your inbox.
            </p>
            <div className="flex flex-nowrap justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Multiple Gmail accounts</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI-powered categorization</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Custom categories</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Card className="shadow-lg border-2 w-full max-w-md">
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
            <CardTitle className="text-2xl text-center">
              {hasAccounts ? "Add Gmail Account" : "Connect Gmail Account"}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {hasAccounts
                ? "Add another Gmail account to monitor"
                : "Add a Gmail account to start organizing your emails"}
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
                  Connect now
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our terms of service and privacy policy
            </p>
            {hasAccounts && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  ← Back to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>🔒 Secure authentication via Google OAuth</p>
        </div>
      </div>
    </div>
  );
}

