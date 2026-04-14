"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const SESSION_EXPIRED_EVENT = "donorix:session-expired";
export const SESSION_EXPIRED_STORAGE_KEY = "donorix-session-expired";

const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

let sessionExpiredNotified = false;

export async function getAuthenticatedHeaders(
  headers?: HeadersInit,
): Promise<Headers> {
  const nextHeaders = new Headers(headers);

  if (!nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return nextHeaders;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    nextHeaders.set("Authorization", `Bearer ${session.access_token}`);
  }

  return nextHeaders;
}

function notifySessionExpired() {
  if (typeof window === "undefined" || sessionExpiredNotified) {
    return;
  }

  sessionExpiredNotified = true;

  try {
    window.sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, SESSION_EXPIRED_MESSAGE);
  } catch {
    // Ignore storage failures and still redirect the user.
  }

  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

  window.setTimeout(() => {
    sessionExpiredNotified = false;
  }, 2000);
}

type AuthenticatedFetchOptions = RequestInit & {
  redirectOnAuthFailure?: boolean;
};

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: AuthenticatedFetchOptions = {},
) {
  const { redirectOnAuthFailure = true, ...requestInit } = init;
  const performRequest = async () =>
    fetch(input, {
      ...requestInit,
      headers: await getAuthenticatedHeaders(requestInit.headers),
    });

  let response = await performRequest();

  if (response.status !== 401) {
    return response;
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return response;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (!error && session?.access_token && !(input instanceof Request)) {
    response = await performRequest();
  }

  if (response.status === 401 && redirectOnAuthFailure) {
    await supabase.auth.signOut();
    notifySessionExpired();
  }

  return response;
}
