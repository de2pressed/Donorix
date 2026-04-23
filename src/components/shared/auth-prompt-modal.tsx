"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { createContext, useContext, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthPromptContextValue = {
  openPrompt: () => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export function AuthPromptProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      openPrompt: () => setOpen(true),
    }),
    [],
  );

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a free account to help save lives</DialogTitle>
            <DialogDescription>
              Sign in to upvote, apply to donate, receive notifications, and create verified requests.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-start sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Continue Browsing
            </Button>
            <Button asChild variant="secondary">
              <a href="/login">Login</a>
            </Button>
            <Button asChild>
              <a href="/signup">Sign Up</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);

  if (!context) {
    throw new Error("useAuthPrompt must be used within AuthPromptProvider");
  }

  return context;
}
